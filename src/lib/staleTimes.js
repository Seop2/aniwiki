// React Query staleTime — 이 시간 동안은 캐시를 그대로 쓰고 TMDB에 다시 요청하지 않는다
const MINUTE = 60 * 1000;

export const STALE_TIME = {
  list: 10 * MINUTE, // 랭킹 · 검색
  detail: 10 * MINUTE, // 작품 상세(시청처 포함)
  recommendations: 60 * MINUTE, // 숨은 명작용 TMDB 추천 — 잘 바뀌지 않는다
  build: Infinity, // 빌드 때 만든 정적 파일(netflix-originals.json)
};
