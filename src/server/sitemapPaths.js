// sitemap.xml에 넣을 작품 상세 주소 — TMDB에서 많이 찾는 작품(작품 상세 /anime/{type}/{id}가 검색에 걸리도록)
import 'server-only';
import { SEEDS } from '@/data/seeds';
import { tmdbGet } from './tmdb';

// [type, sort 파라미터, 페이지 수] — 앱의 평점순 · 인기순 랭킹 앞부분과 같다
const LISTS = [
  ['tv', { sort_by: 'vote_average.desc', 'vote_count.gte': 200 }, 5],
  ['tv', { sort_by: 'popularity.desc' }, 3],
  ['movie', { sort_by: 'vote_average.desc', 'vote_count.gte': 200 }, 3],
  ['movie', { sort_by: 'popularity.desc' }, 2],
];

async function fetchIds(type, params, page) {
  const data = await tmdbGet(`/discover/${type}`, { with_genres: 16, page, ...params }, { revalidate: 86400 });
  return data.results.map((r) => `/anime/${type}/${r.id}`);
}

export async function animePaths() {
  const pages = LISTS.flatMap(([type, params, count]) =>
    Array.from({ length: count }, (_, i) => fetchIds(type, params, i + 1)));
  const seeds = SEEDS.map((s) => `/anime/tv/${s.id}`);
  return [...new Set([...seeds, ...(await Promise.all(pages)).flat()])];
}
