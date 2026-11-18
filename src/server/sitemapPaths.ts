// sitemap.xml에 넣을 작품 상세 주소 — TMDB에서 많이 찾는 작품(작품 상세 /anime/{type}/{id}가 검색에 걸리도록)
import 'server-only';
import type { MediaType, SortKey } from '@/types';
import { SEEDS } from '@/data/seeds';
import { ANIMATION_GENRE_ID, SORTS } from '@/lib/catalog';
import { tmdbGet } from './tmdb';

// [type, 정렬, 페이지 수] — 정렬 조건은 앱 랭킹(SORTS)과 같다. 시청처 필터는 걸지 않아 앱 랭킹보다 넓다
const LISTS: [MediaType, SortKey, number][] = [
  ['tv', 'rating', 5],
  ['tv', 'popular', 3],
  ['movie', 'rating', 3],
  ['movie', 'popular', 2],
];

async function fetchIds(type: MediaType, sort: SortKey, page: number) {
  const params = { with_genres: ANIMATION_GENRE_ID, page, ...SORTS[sort].params(type) };
  const data = await tmdbGet(`/discover/${type}`, params, { revalidate: 86400 });
  return data.results.map((r) => `/anime/${type}/${r.id}`);
}

export async function animePaths() {
  const pages = LISTS.flatMap(([type, sort, count]) =>
    Array.from({ length: count }, (_, i) => fetchIds(type, sort, i + 1)));
  const seeds = SEEDS.map((s) => `/anime/tv/${s.id}`);
  return [...new Set([...seeds, ...(await Promise.all(pages)).flat()])];
}
