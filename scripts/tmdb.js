// 서버용 TMDB 요청(sitemap · 넷플릭스 오리지널 라우트). env는 process.env
export async function tmdbGet(env, path, params = {}) {
  if (!env.VITE_TMDB_TOKEN && !env.VITE_TMDB_API_KEY) throw new Error('MISSING_TOKEN');
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  const auth = env.VITE_TMDB_TOKEN ? {} : { api_key: env.VITE_TMDB_API_KEY };
  Object.entries({ language: 'ko-KR', ...auth, ...params }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: env.VITE_TMDB_TOKEN ? { Authorization: `Bearer ${env.VITE_TMDB_TOKEN}` } : {},
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} ${path}`);
  return res.json();
}

/** 동시에 limit개씩 돌린다 (TMDB 요청 제한 대비) */
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
