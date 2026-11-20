import "server-only";
import type { MediaType, SortKey } from "@/types";
import { SEEDS } from "@/data/seeds";
import { ANIMATION_GENRE_ID, SORTS } from "@/lib/catalog";
import { REVALIDATE, tmdbGet } from "./tmdb";

const LISTS: [MediaType, SortKey, number][] = [
  ["tv", "rating", 5],
  ["tv", "popular", 3],
  ["movie", "rating", 3],
  ["movie", "popular", 2],
];

async function fetchIds(type: MediaType, sort: SortKey, page: number) {
  const params = {
    with_genres: ANIMATION_GENRE_ID,
    page,
    ...SORTS[sort].params(type),
  };
  const data = await tmdbGet(`/discover/${type}`, params, {
    revalidate: REVALIDATE.daily,
  });
  return data.results.map((r) => `/anime/${type}/${r.id}`);
}

export async function animePaths() {
  const pages = LISTS.flatMap(([type, sort, count]) =>
    Array.from({ length: count }, (_, i) => fetchIds(type, sort, i + 1)),
  );
  const seeds = SEEDS.map((s) => `/anime/tv/${s.id}`);
  return [...new Set([...seeds, ...(await Promise.all(pages)).flat()])];
}
