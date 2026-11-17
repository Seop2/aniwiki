// 브라우저에서 부르는 데이터 요청. TMDB는 서버(app/api, src/server/tmdb.js)가 대신 불러 토큰이 노출되지 않는다
export { MEDIA, PROVIDERS, SORTS, posterUrl } from '../lib/catalog';

async function getJson(path, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, value);
  });
  const qs = search.toString();
  const res = await fetch(qs ? `${path}?${qs}` : path);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

/** 한 페이지(20개)를 가져온다. query가 있으면 검색, 없으면 discover */
export const fetchAnimePage = ({ type, sort, query, page, providers = [] }) =>
  getJson('/api/anime', query ? { type, query, page } : { type, sort, page, providers: providers.join(',') });

/** 작품별 TMDB 추천 목록 한 페이지(20편) */
export const fetchRecommendations = ({ type, id, page = 1 }) =>
  getJson(`/api/anime/${type}/${id}/recommendations`, { page });

/** 상세 정보 + 시청 가능 플랫폼 */
export const fetchAnimeDetail = ({ type, id }) => getJson(`/api/anime/${type}/${id}`);

/** 하루마다 다시 만드는 「한국 넷플릭스에서 볼 수 있는 넷플릭스 오리지널」 목록 (src/server/netflixOriginals.js) */
export const fetchNetflixOriginals = () => getJson('/netflix-originals.json');
