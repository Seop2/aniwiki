// 빌드할 때 TMDB에서 많이 찾는 작품을 받아 sitemap.xml을 만든다(작품 상세 /anime/{type}/{id}가 검색에 걸리도록).
// TMDB 요청이 실패해도 빌드는 멈추지 않고 고정 주소만 담는다.
import { SEEDS } from '../src/data/seeds.js';

const ORIGIN = 'https://www.aniwiki.link';
const STATIC_PATHS = ['/', '/discover'];

// [type, sort 파라미터, 페이지 수] — 앱의 평점순 · 인기순 랭킹 앞부분과 같다
const LISTS = [
  ['tv', { sort_by: 'vote_average.desc', 'vote_count.gte': 200 }, 5],
  ['tv', { sort_by: 'popularity.desc' }, 3],
  ['movie', { sort_by: 'vote_average.desc', 'vote_count.gte': 200 }, 3],
  ['movie', { sort_by: 'popularity.desc' }, 2],
];

async function fetchIds(env, type, params, page) {
  const url = new URL(`https://api.themoviedb.org/3/discover/${type}`);
  const auth = env.VITE_TMDB_TOKEN ? {} : { api_key: env.VITE_TMDB_API_KEY };
  Object.entries({ with_genres: 16, page, ...auth, ...params }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: env.VITE_TMDB_TOKEN ? { Authorization: `Bearer ${env.VITE_TMDB_TOKEN}` } : {},
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const data = await res.json();
  return data.results.map((r) => `/anime/${type}/${r.id}`);
}

async function animePaths(env) {
  if (!env.VITE_TMDB_TOKEN && !env.VITE_TMDB_API_KEY) throw new Error('MISSING_TOKEN');
  const pages = LISTS.flatMap(([type, params, count]) =>
    Array.from({ length: count }, (_, i) => fetchIds(env, type, params, i + 1)));
  const seeds = SEEDS.map((s) => `/anime/tv/${s.id}`);
  return [...new Set([...seeds, ...(await Promise.all(pages)).flat()])];
}

const toXml = (paths, lastmod) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url>
    <loc>${ORIGIN}${p}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>
`;

export default function sitemap(env) {
  return {
    name: 'aniwiki-sitemap',
    apply: 'build',
    async generateBundle() {
      let anime = [];
      try {
        anime = await animePaths(env);
      } catch (e) {
        this.warn(`작품 주소 없이 sitemap.xml을 만듭니다 (${e.message})`);
      }
      const lastmod = new Date().toISOString().slice(0, 10);
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: toXml([...STATIC_PATHS, ...anime], lastmod) });
    },
  };
}
