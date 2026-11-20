import "server-only";
import type { MediaType, NetflixOriginal } from "@/types";
import { ANIMATION_GENRE_ID, today } from "@/lib/catalog";
import { MEDIA, normalize } from "@/lib/media";
import {
  isNetflixOriginal,
  NETFLIX_NETWORK,
  NETFLIX_PROVIDERS,
} from "@/lib/netflix";
import { mapLimit, REVALIDATE, tmdbGet } from "./tmdb";

const MAX_PAGES = 30;
const DAILY = { revalidate: REVALIDATE.daily };

const candidateParams = (type: MediaType) => ({
  with_genres: ANIMATION_GENRE_ID,
  watch_region: "KR",
  with_watch_providers: NETFLIX_PROVIDERS.join("|"),
  with_watch_monetization_types: "flatrate|ads",
  [`${MEDIA[type].dateParam}.lte`]: today(),
  ...(type === "tv" && { with_networks: NETFLIX_NETWORK }),
});

async function candidates(type: MediaType) {
  const params = candidateParams(type);
  const first = await tmdbGet(
    `/discover/${type}`,
    { ...params, page: 1 },
    DAILY,
  );
  const rest = Array.from(
    { length: Math.min(first.total_pages, MAX_PAGES) - 1 },
    (_, i) => i + 2,
  );
  const pages = await mapLimit(rest, 5, (page) =>
    tmdbGet(`/discover/${type}`, { ...params, page }, DAILY),
  );
  return [first, ...pages].flatMap((p) => p.results);
}

async function originals(type: MediaType): Promise<NetflixOriginal[]> {
  const list = await candidates(type);
  const append =
    type === "movie" ? { append_to_response: "release_dates" } : {};
  const details = await mapLimit(list, 10, (r) =>
    tmdbGet<Parameters<typeof isNetflixOriginal>[0]>(
      `/${type}/${r.id}`,
      append,
      DAILY,
    ),
  );
  return list
    .filter((_, i) => isNetflixOriginal(details[i]))
    .map((r) => {
      const { genreIds, ...item } = normalize(r, type);
      return { type, ...item };
    });
}

export async function buildNetflixOriginals() {
  const [tv, movie] = await Promise.all([originals("tv"), originals("movie")]);
  return [...tv, ...movie];
}
