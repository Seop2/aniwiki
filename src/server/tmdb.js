import 'server-only';
import { ANIMATION_GENRE_ID, ORIGINS, PROVIDERS, SORTS } from '@/lib/catalog';
import { normalize } from '@/lib/media';
import { isNetflixOriginal } from '@/lib/netflix';
import { STALE_TIME } from '@/lib/queries';

const BASE_URL = 'https://api.themoviedb.org/3';

export const REVALIDATE = {
  list: STALE_TIME.list / 1000,
  detail: STALE_TIME.detail / 1000,
  recommendations: STALE_TIME.recommendations / 1000,
};

export class TmdbError extends Error {
  constructor(status, path) {
    super(`TMDB ${status} ${path}`);
    this.status = status;
  }
}

export async function tmdbGet(path, params = {}, { revalidate = REVALIDATE.list } = {}) {
  const token = process.env.TMDB_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) throw new Error('MISSING_TOKEN');

  const url = new URL(BASE_URL + path);
  Object.entries({ language: 'ko-KR', ...(token ? {} : { api_key: apiKey }), ...params }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value);
  });

  const res = await fetch(url, {
    headers: { accept: 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    next: { revalidate },
  });
  if (!res.ok) throw new TmdbError(res.status, path);
  return res.json();
}

export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
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

function providerParams(keys) {
  const picked = PROVIDERS.filter((p) => keys.includes(p.key));
  const ids = (picked.length ? picked : PROVIDERS).flatMap((p) => p.ids);
  return { watch_region: 'KR', with_watch_providers: ids.join('|'), with_watch_monetization_types: 'flatrate|free|ads' };
}

export async function fetchAnimePage({ type, sort, query, page, providers = [], origin = '' }) {
  const data = query
    ? await tmdbGet(`/search/${type}`, { query, page })
    : await tmdbGet(`/discover/${type}`, {
        with_genres: ANIMATION_GENRE_ID,
        page,
        ...SORTS[sort].params(type),
        ...providerParams(providers),
        with_origin_country: ORIGINS[origin]?.countries,
      });

  const results = query
    ? data.results.filter((r) => r.genre_ids?.includes(ANIMATION_GENRE_ID))
    : data.results;

  return {
    items: results.map((r) => normalize(r, type)),
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  };
}

export async function fetchRecommendations({ type, id, page = 1 }) {
  const data = await tmdbGet(`/${type}/${id}/recommendations`, { page }, { revalidate: REVALIDATE.recommendations });
  return data.results.map((r) => normalize(r, type));
}

const TV_STATUS = {
  'Returning Series': '방영 중',
  Ended: '완결',
  Canceled: '방영 중단',
  'In Production': '제작 중',
  Planned: '방영 예정',
  Pilot: '파일럿',
};

const HIDDEN_PROVIDERS = [283];

const isDuplicateNetflix = (p, all) => p.provider_id === 1796 && all.some((q) => q.provider_id === 8);

const PROVIDER_GROUPS = [
  ['flatrate', '구독'],
  ['free', '무료'],
  ['ads', '광고 포함 무료'],
  ['rent', '대여'],
  ['buy', '구매'],
];

function normalizeProviders(raw) {
  const kr = raw?.results?.KR;
  if (!kr) return null;

  const groups = PROVIDER_GROUPS
    .map(([key, label]) => ({
      label,
      items: (kr[key] ?? [])
        .filter((p, _, all) => !HIDDEN_PROVIDERS.includes(p.provider_id) && !isDuplicateNetflix(p, all))
        .sort((a, b) => a.display_priority - b.display_priority)
        .map((p) => ({ id: p.provider_id, name: p.provider_name, logo: p.logo_path })),
    }))
    .filter((g) => g.items.length > 0);

  return groups.length ? { link: kr.link, groups } : null;
}

const VIDEO_TYPES = ['Trailer', 'Teaser'];
const VIDEO_LANGS = ['ko', 'ja', 'en'];
const rankOf = (list, value) => (list.includes(value) ? list.indexOf(value) : list.length);

function pickVideo(raw) {
  const rank = (v) => [v.official ? 0 : 1, rankOf(VIDEO_TYPES, v.type), rankOf(VIDEO_LANGS, v.iso_639_1)];
  const [best] = (raw?.results ?? [])
    .filter((v) => v.site === 'YouTube')
    .map((v) => ({ v, r: rank(v) }))
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.r[2] - b.r[2] || a.v.published_at.localeCompare(b.v.published_at));
  return best ? { key: best.v.key, name: best.v.name } : null;
}

export async function fetchAnimeDetail({ type, id }) {
  const append = type === 'movie' ? 'watch/providers,release_dates,videos' : 'watch/providers,videos';
  const raw = await tmdbGet(
    `/${type}/${id}`,
    { append_to_response: append, include_video_language: 'ko,ja,en,null' },
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
    status: type === 'tv' ? (TV_STATUS[raw.status] ?? raw.status) : null,
    networks: (raw.networks ?? []).map((n) => n.name),
    runtime: raw.runtime,
    providers: normalizeProviders(raw['watch/providers']),
    netflixOriginal: isNetflixOriginal(raw),
    video: pickVideo(raw.videos),
  };
}
