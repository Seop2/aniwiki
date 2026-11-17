// 화면(필터 · 정렬)과 서버(TMDB 요청 파라미터)가 함께 쓰는 설정
import { MEDIA } from './media';
import { NETFLIX_PROVIDERS } from './netflix';

export { MEDIA };

export const ANIMATION_GENRE_ID = 16;

/** 「볼 수 있는 곳」 필터 — 한국 TMDB(JustWatch) 시청처 id. 라프텔은 TMDB에 없다 */
export const PROVIDERS = [
  { key: 'netflix', label: '넷플릭스', ids: NETFLIX_PROVIDERS },
  { key: 'disney', label: '디즈니+', ids: [337] },
  { key: 'tving', label: '티빙', ids: [1883] },
  { key: 'watcha', label: '왓챠', ids: [97] },
];

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
