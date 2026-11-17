// 「한국 넷플릭스에서 볼 수 있는 넷플릭스 오리지널 애니」 목록(/netflix-originals.json, app 라우트가 하루마다 다시 만든다).
// 오리지널 여부는 상세(방송사 · 제작사)를 봐야 알 수 있어 목록 API만으로는 걸러지지 않는다 → 후보를 받은 뒤 상세로 판별.
import { MEDIA, normalize } from '../src/lib/media.js';
import { isNetflixOriginal, NETFLIX_NETWORK, NETFLIX_PROVIDERS } from '../src/lib/netflix.js';
import { mapLimit, tmdbGet } from './tmdb.js';

const MAX_PAGES = 30;

const candidateParams = (type) => ({
  with_genres: 16,
  watch_region: 'KR',
  with_watch_providers: NETFLIX_PROVIDERS.join('|'),
  with_watch_monetization_types: 'flatrate|ads',
  [`${MEDIA[type].dateParam}.lte`]: new Date().toISOString().slice(0, 10),
  // 극장판은 좁힐 조건이 없어 한국 넷플릭스 극장판 전체가 후보(400여 편)
  ...(type === 'tv' && { with_networks: NETFLIX_NETWORK }),
});

async function candidates(env, type) {
  const params = candidateParams(type);
  const first = await tmdbGet(env, `/discover/${type}`, { ...params, page: 1 });
  const rest = Array.from({ length: Math.min(first.total_pages, MAX_PAGES) - 1 }, (_, i) => i + 2);
  const pages = await mapLimit(rest, 5, (page) => tmdbGet(env, `/discover/${type}`, { ...params, page }));
  return [first, ...pages].flatMap((p) => p.results);
}

async function originals(env, type) {
  const list = await candidates(env, type);
  const append = type === 'movie' ? { append_to_response: 'release_dates' } : {};
  const details = await mapLimit(list, 10, (r) => tmdbGet(env, `/${type}/${r.id}`, append));
  return list
    .filter((_, i) => isNetflixOriginal(details[i]))
    .map((r) => {
      const { genreIds, originalLanguage, ...item } = normalize(r, type);
      return { type, ...item };
    });
}

export async function buildNetflixOriginals(env) {
  return [...(await originals(env, 'tv')), ...(await originals(env, 'movie'))];
}
