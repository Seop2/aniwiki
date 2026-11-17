import { MEDIA } from './media';
import { NETFLIX_PROVIDERS } from './netflix';

export { MEDIA };

export const ANIMATION_GENRE_ID = 16;

export const PROVIDERS = [
  { key: 'netflix', label: '넷플릭스', ids: NETFLIX_PROVIDERS },
  { key: 'disney', label: '디즈니+', ids: [337] },
  { key: 'tving', label: '티빙', ids: [1883] },
  { key: 'watcha', label: '왓챠', ids: [97] },
];

export const posterUrl = (path, size = 'w92') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

const today = () => new Date().toISOString().slice(0, 10);

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
