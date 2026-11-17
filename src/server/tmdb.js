// 서버에서만 TMDB를 부른다 — 토큰(TMDB_TOKEN · TMDB_API_KEY)은 브라우저 번들에 들어가지 않는다
import 'server-only';
import { ANIMATION_GENRE_ID, PROVIDERS, SORTS } from '@/lib/catalog';
import { normalize } from '@/lib/media';
import { isNetflixOriginal } from '@/lib/netflix';
import { STALE_TIME } from '@/lib/staleTimes';

const BASE_URL = 'https://api.themoviedb.org/3';

/** React Query staleTime(ms)과 같은 시간 동안 서버도 TMDB 응답을 캐시한다(초) */
export const REVALIDATE = {
  list: STALE_TIME.list / 1000,
  detail: STALE_TIME.detail / 1000,
  recommendations: STALE_TIME.recommendations / 1000,
};

export class TmdbError extends Error {
  constructor(status, path) {
    super(`TMDB ${status} ${path}`);
    this.status = status;
  }
}

export async function tmdbGet(path, params = {}, { revalidate = REVALIDATE.list } = {}) {
  const token = process.env.TMDB_TOKEN;
  const apiKey = process.env.TMDB_API_KEY; // v3 API 키 (TOKEN이 없을 때 사용)
  if (!token && !apiKey) throw new Error('MISSING_TOKEN');

  const url = new URL(BASE_URL + path);
  Object.entries({ language: 'ko-KR', ...(token ? {} : { api_key: apiKey }), ...params }).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value);
  });

  const res = await fetch(url, {
    headers: { accept: 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    next: { revalidate },
  });
  if (!res.ok) throw new TmdbError(res.status, path);
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

/** 구독 · 무료로 볼 수 있는 작품만(대여 · 구매 제외). 서비스끼리는 OR. 아무것도 안 고르면 필터의 모든 서비스 */
function providerParams(keys) {
  const picked = PROVIDERS.filter((p) => keys.includes(p.key));
  const ids = (picked.length ? picked : PROVIDERS).flatMap((p) => p.ids);
  return { watch_region: 'KR', with_watch_providers: ids.join('|'), with_watch_monetization_types: 'flatrate|free|ads' };
}

/** 한 페이지(20개)를 가져온다. query가 있으면 검색, 없으면 discover */
export async function fetchAnimePage({ type, sort, query, page, providers = [] }) {
  const data = query
    ? await tmdbGet(`/search/${type}`, { query, page })
    : await tmdbGet(`/discover/${type}`, {
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
  const data = await tmdbGet(`/${type}/${id}/recommendations`, { page }, { revalidate: REVALIDATE.recommendations });
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
  const raw = await tmdbGet(`/${type}/${id}`, { append_to_response: append }, { revalidate: REVALIDATE.detail });

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
