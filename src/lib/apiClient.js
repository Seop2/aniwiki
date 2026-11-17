// 브라우저에서 부르는 데이터 요청(app/api/* 호출). TMDB는 서버(src/server/tmdb.js)가 대신 불러 토큰이 노출되지 않는다

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

export const fetchAnimePage = ({ type, sort, query, page, providers = [] }) =>
  getJson('/api/anime', query ? { type, query, page } : { type, sort, page, providers: providers.join(',') });

export const fetchRecommendations = ({ type, id, page = 1 }) =>
  getJson(`/api/anime/${type}/${id}/recommendations`, { page });

export const fetchAnimeDetail = ({ type, id }) => getJson(`/api/anime/${type}/${id}`);

export const fetchNetflixOriginals = () => getJson('/netflix-originals.json');
