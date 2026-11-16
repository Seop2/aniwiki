import { MEDIA, normalize } from '../lib/media';
import { isNetflixOriginal, NETFLIX_PROVIDERS } from '../lib/netflix';

const BASE_URL = 'https://api.themoviedb.org/3';
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // v3 API 키 (TOKEN이 없을 때 사용)
const ANIMATION_GENRE_ID = 16;

export { MEDIA };

/** 「볼 수 있는 곳」 필터 — 한국 TMDB(JustWatch) 시청처 id. 라프텔은 TMDB에 없다 */
export const PROVIDERS = [
  { key: 'netflix', label: '넷플릭스', ids: NETFLIX_PROVIDERS },
  { key: 'disney', label: '디즈니+', ids: [337] },
  { key: 'tving', label: '티빙', ids: [1883] },
  { key: 'watcha', label: '왓챠', ids: [97] },
];

/** 구독 · 무료로 볼 수 있는 작품만(대여 · 구매 제외). 서비스끼리는 OR. 아무것도 안 고르면 필터의 모든 서비스 */
function providerParams(keys) {
  const picked = PROVIDERS.filter((p) => keys.includes(p.key));
  const ids = (picked.length ? picked : PROVIDERS).flatMap((p) => p.ids);
  return { watch_region: 'KR', with_watch_providers: ids.join('|'), with_watch_monetization_types: 'flatrate|free|ads' };
}

export const posterUrl = (path, size = 'w92') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

const today = () => new Date().toISOString().slice(0, 10);

/** 정렬 옵션 → discover 쿼리 파라미터 + 검색 결과용 클라이언트 비교 함수 */
export const SORTS = {
  rating: {
    label: '평점순',
    params: () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 200 }),
    compare: (a, b) => b.rating - a.rating,
  },
  popular: {
    label: '인기순',
    params: () => ({ sort_by: 'popularity.desc' }),
    compare: (a, b) => b.popularity - a.popularity,
  },
  votes: {
    label: '투표수순',
    params: () => ({ sort_by: 'vote_count.desc' }),
    compare: (a, b) => b.votes - a.votes,
  },
  latest: {
    label: '최신순',
    params: (type) => {
      const key = MEDIA[type].dateParam;
      return { sort_by: `${key}.desc`, [`${key}.lte`]: today(), 'vote_count.gte': 10 };
    },
    compare: (a, b) => (b.date ?? '').localeCompare(a.date ?? ''),
  },
};

async function request(path, params = {}) {
  if (!TOKEN && !API_KEY) throw new Error('MISSING_TOKEN');

  const url = new URL(BASE_URL + path);
  Object.entries({ language: 'ko-KR', ...(TOKEN ? {} : { api_key: API_KEY }), ...params }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value);
  });

  const res = await fetch(url, {
    headers: { accept: 'application/json', ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }) },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

/** 한 페이지(20개)를 가져온다. query가 있으면 검색, 없으면 discover */
export async function fetchAnimePage({ type, sort, query, page, providers = [] }) {
  const data = query
    ? await request(`/search/${type}`, { query, page })
    : await request(`/discover/${type}`, {
        with_genres: ANIMATION_GENRE_ID,
        page,
        ...SORTS[sort].params(type),
        ...providerParams(providers),
      });

  // 검색 API는 장르 필터가 없으므로 애니메이션만 걸러낸다
  const results = query
    ? data.results.filter((r) => r.genre_ids?.includes(ANIMATION_GENRE_ID))
    : data.results;

  return {
    items: results.map((r) => normalize(r, type)),
    page: data.page,
    totalPages: Math.min(data.total_pages, 500), // TMDB는 500페이지까지만 허용
    totalResults: data.total_results,
  };
}

/** 작품별 TMDB 추천 목록 한 페이지(20편) */
export async function fetchRecommendations({ type, id, page = 1 }) {
  const data = await request(`/${type}/${id}/recommendations`, { page });
  return data.results.map((r) => normalize(r, type));
}

const TV_STATUS = {
  'Returning Series': '방영 중',
  Ended: '완결',
  Canceled: '방영 중단',
  'In Production': '제작 중',
  Planned: '방영 예정',
  Pilot: '파일럿',
};

// 한국 크런치롤은 대부분 지역 제한으로 재생이 안 되는데 TMDB(JustWatch)에는 볼 수 있다고 나온다
// (2026-11 확인: 프리렌 · 진격 · 하이큐 등 상위 12편 중 10편 이용 불가) → 표시하지 않는다
const HIDDEN_PROVIDERS = [283];

// 넷플릭스 광고형 요금제(1796)는 같은 넷플릭스라 일반(8)과 함께 있으면 하나만 보여 준다
const isDuplicateNetflix = (p, all) => p.provider_id === 1796 && all.some((q) => q.provider_id === 8);

const PROVIDER_GROUPS = [
  ['flatrate', '구독'],
  ['free', '무료'],
  ['ads', '광고 포함 무료'],
  ['rent', '대여'],
  ['buy', '구매'],
];

/** watch/providers 응답에서 한국(KR) 시청 정보만 뽑아 그룹별로 정리한다 */
function normalizeProviders(raw) {
  const kr = raw?.results?.KR;
  if (!kr) return null;

  const groups = PROVIDER_GROUPS
    .map(([key, label]) => ({
      label,
      items: (kr[key] ?? [])
        .filter((p, _, all) => !HIDDEN_PROVIDERS.includes(p.provider_id) && !isDuplicateNetflix(p, all))
        .sort((a, b) => a.display_priority - b.display_priority)
        .map((p) => ({ id: p.provider_id, name: p.provider_name, logo: p.logo_path })),
    }))
    .filter((g) => g.items.length > 0);

  return groups.length ? { link: kr.link, groups } : null;
}

/** 상세 정보 + 시청 가능 플랫폼을 한 번의 요청으로 가져온다 */
export async function fetchAnimeDetail({ type, id }) {
  // 극장판의 오리지널 판별에는 공개 기록(release_dates)이 필요하다
  const append = type === 'movie' ? 'watch/providers,release_dates' : 'watch/providers';
  const raw = await request(`/${type}/${id}`, { append_to_response: append });

  return {
    ...normalize(raw, type),
    backdrop: raw.backdrop_path,
    overview: raw.overview,
    tagline: raw.tagline,
    homepage: raw.homepage,
    genres: (raw.genres ?? []).map((g) => g.name),
    seasons: raw.number_of_seasons,
    episodes: raw.number_of_episodes,
    status: type === 'tv' ? (TV_STATUS[raw.status] ?? raw.status) : null,
    networks: (raw.networks ?? []).map((n) => n.name),
    runtime: raw.runtime,
    providers: normalizeProviders(raw['watch/providers']),
    netflixOriginal: isNetflixOriginal(raw),
  };
}

/** 빌드 때 만든 「한국 넷플릭스에서 볼 수 있는 넷플릭스 오리지널」 목록 (scripts/netflixOriginals.js) */
export async function fetchNetflixOriginals() {
  const res = await fetch('/netflix-originals.json');
  if (!res.ok) throw new Error(`netflix-originals ${res.status}`);
  return res.json();
}
