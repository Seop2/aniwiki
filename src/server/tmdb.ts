import "server-only";
import type {
  AnimePage,
  DetailParams,
  ListParams,
  MediaType,
  ProviderKey,
} from "@/types";
import { ANIMATION_GENRE_ID, ORIGINS, PROVIDERS, SORTS } from "@/lib/catalog";
import { normalize, type TmdbListItem } from "@/lib/media";
import {
  isNetflixOriginal,
  NETFLIX_ADS_ID,
  NETFLIX_ID,
  originalAppend,
  type TmdbReleaseDates,
} from "@/lib/netflix";
import { STALE_TIME } from "@/lib/queries";

const BASE_URL = "https://api.themoviedb.org/3";

export const MAX_PAGE = 500;

export const REVALIDATE = {
  list: STALE_TIME.list / 1000,
  detail: STALE_TIME.detail / 1000,
  recommendations: STALE_TIME.recommendations / 1000,
  daily: 86400,
};

type Params = Record<string, string | number | undefined>;

interface TmdbList {
  page: number;
  results: TmdbListItem[];
  total_pages: number;
  total_results: number;
}

interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

interface TmdbVideo {
  site: string;
  key: string;
  name: string;
  type: string;
  official: boolean;
  iso_639_1: string;
  published_at: string;
}

interface TmdbDetail extends TmdbListItem {
  backdrop_path: string | null;
  overview: string;
  tagline: string;
  homepage: string;
  genres?: { name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status: string;
  networks?: { id: number; name: string }[];
  production_companies?: { id: number }[];
  runtime?: number;
  release_dates?: TmdbReleaseDates;
  videos?: { results: TmdbVideo[] };
  "watch/providers"?: {
    results: Record<
      string,
      ({ link: string } & Partial<Record<string, TmdbProvider[]>>) | undefined
    >;
  };
}

export class TmdbError extends Error {
  status: number;

  constructor(status: number, path: string) {
    super(`TMDB ${status} ${path}`);
    this.status = status;
  }
}

export async function tmdbGet<T = TmdbList>(
  path: string,
  params: Params = {},
  { revalidate = REVALIDATE.list } = {},
): Promise<T> {
  const token = process.env.TMDB_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) throw new Error("MISSING_TOKEN");

  const url = new URL(BASE_URL + path);
  Object.entries({
    language: "ko-KR",
    ...(token ? {} : { api_key: apiKey }),
    ...params,
  }).forEach(([key, value]) => {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  });

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    next: { revalidate },
  });
  if (!res.ok) throw new TmdbError(res.status, path);
  return res.json();
}

export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
) {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: limit }, worker));
  return out;
}

export const discoverAnime = (
  type: MediaType,
  params: Params,
  options?: { revalidate?: number },
) =>
  tmdbGet(
    `/discover/${type}`,
    { with_genres: ANIMATION_GENRE_ID, ...params },
    options,
  );

export const watchParams = (ids: readonly number[], monetization: string) => ({
  watch_region: "KR",
  with_watch_providers: ids.join("|"),
  with_watch_monetization_types: monetization,
});

function providerParams(keys: ProviderKey[]) {
  const picked = PROVIDERS.filter((p) => keys.includes(p.key));
  const ids = (picked.length ? picked : PROVIDERS).flatMap((p) => p.ids);
  return watchParams(ids, "flatrate|free|ads");
}

export async function fetchAnimePage({
  type,
  sort,
  query,
  page,
  providers = [],
  origin = "",
}: ListParams): Promise<AnimePage> {
  const data = query
    ? await tmdbGet(`/search/${type}`, { query, page })
    : await discoverAnime(type, {
        page,
        ...SORTS[sort].params(type),
        ...providerParams(providers),
        with_origin_country: origin ? ORIGINS[origin].countries : undefined,
      });

  const results = query
    ? data.results.filter((r) => r.genre_ids?.includes(ANIMATION_GENRE_ID))
    : data.results;

  return {
    items: results.map((r) => normalize(r, type)),
    page: data.page,
    totalPages: Math.min(data.total_pages, MAX_PAGE),
    totalResults: data.total_results,
  };
}

export async function fetchRecommendations({
  type,
  id,
  page = 1,
}: DetailParams & { page?: number }) {
  const data = await tmdbGet(
    `/${type}/${id}/recommendations`,
    { page },
    { revalidate: REVALIDATE.recommendations },
  );
  return data.results.map((r) => normalize(r, type));
}

const TV_STATUS: Record<string, string> = {
  "Returning Series": "방영 중",
  Ended: "완결",
  Canceled: "방영 중단",
  "In Production": "제작 중",
  Planned: "방영 예정",
  Pilot: "파일럿",
};

const HIDDEN_PROVIDERS = [283];

const isDuplicateNetflix = (p: TmdbProvider, all: TmdbProvider[]) =>
  p.provider_id === NETFLIX_ADS_ID &&
  all.some((q) => q.provider_id === NETFLIX_ID);

const PROVIDER_GROUPS = [
  ["flatrate", "구독"],
  ["free", "무료"],
  ["ads", "광고 포함 무료"],
  ["rent", "대여"],
  ["buy", "구매"],
];

function normalizeProviders(raw: TmdbDetail["watch/providers"]) {
  const kr = raw?.results?.KR;
  if (!kr) return null;

  const groups = PROVIDER_GROUPS.map(([key, label]) => ({
    label,
    items: (kr[key] ?? [])
      .filter(
        (p, _, all) =>
          !HIDDEN_PROVIDERS.includes(p.provider_id) &&
          !isDuplicateNetflix(p, all),
      )
      .sort((a, b) => a.display_priority - b.display_priority)
      .map((p) => ({
        id: p.provider_id,
        name: p.provider_name,
        logo: p.logo_path,
      })),
  })).filter((g) => g.items.length > 0);

  return groups.length ? { link: kr.link, groups } : null;
}

const VIDEO_TYPES = ["Trailer", "Teaser"];
const VIDEO_LANGS = ["ko", "ja", "en"];
const rankOf = (list: string[], value: string) =>
  list.includes(value) ? list.indexOf(value) : list.length;

function pickVideo(raw: TmdbDetail["videos"]) {
  const rank = (v: TmdbVideo) => [
    v.official ? 0 : 1,
    rankOf(VIDEO_TYPES, v.type),
    rankOf(VIDEO_LANGS, v.iso_639_1),
  ];
  const [best] = (raw?.results ?? [])
    .filter((v) => v.site === "YouTube")
    .map((v) => ({ v, r: rank(v) }))
    .sort(
      (a, b) =>
        a.r[0] - b.r[0] ||
        a.r[1] - b.r[1] ||
        a.r[2] - b.r[2] ||
        a.v.published_at.localeCompare(b.v.published_at),
    );
  return best ? { key: best.v.key, name: best.v.name } : null;
}

export async function fetchAnimeDetail({ type, id }: DetailParams) {
  const append = ["watch/providers", "videos", ...originalAppend(type)];
  const raw = await tmdbGet<TmdbDetail>(
    `/${type}/${id}`,
    {
      append_to_response: append.join(","),
      include_video_language: "ko,ja,en,null",
    },
    { revalidate: REVALIDATE.detail },
  );

  return {
    ...normalize(raw, type),
    backdrop: raw.backdrop_path,
    overview: raw.overview,
    tagline: raw.tagline,
    homepage: raw.homepage,
    genres: (raw.genres ?? []).map((g) => g.name),
    seasons: raw.number_of_seasons,
    episodes: raw.number_of_episodes,
    status: type === "tv" ? (TV_STATUS[raw.status] ?? raw.status) : null,
    networks: (raw.networks ?? []).map((n) => n.name),
    runtime: raw.runtime,
    providers: normalizeProviders(raw["watch/providers"]),
    netflixOriginal: isNetflixOriginal(raw),
    video: pickVideo(raw.videos),
  };
}
