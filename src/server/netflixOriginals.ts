import "server-only";
import type { MediaType, NetflixOriginal } from "@/types";
import { releasedParams } from "@/lib/catalog";
import { normalize } from "@/lib/media";
import {
  isNetflixOriginal,
  NETFLIX_NETWORK,
  NETFLIX_PROVIDERS,
  originalAppend,
} from "@/lib/netflix";
import {
  discoverAnime,
  mapLimit,
  REVALIDATE,
  tmdbGet,
  watchParams,
} from "./tmdb";

const MAX_PAGES = 30;
const DAILY = { revalidate: REVALIDATE.daily };

const candidateParams = (type: MediaType) => ({
  ...watchParams(NETFLIX_PROVIDERS, "flatrate|ads"),
  ...releasedParams(type),
  ...(type === "tv" && { with_networks: NETFLIX_NETWORK }),
});

async function candidates(type: MediaType) {
  const params = candidateParams(type);
  const first = await discoverAnime(type, { ...params, page: 1 }, DAILY);
  const rest = Array.from(
    { length: Math.min(first.total_pages, MAX_PAGES) - 1 },
    (_, i) => i + 2,
  );
  const pages = await mapLimit(rest, 5, (page) =>
    discoverAnime(type, { ...params, page }, DAILY),
  );
  return [first, ...pages].flatMap((p) => p.results);
}

async function originals(type: MediaType): Promise<NetflixOriginal[]> {
  const list = await candidates(type);
  const append = { append_to_response: originalAppend(type).join(",") };
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
