const MINUTE = 60 * 1000;

export const STALE_TIME = {
  list: 10 * MINUTE,
  detail: 10 * MINUTE,
  recommendations: 60 * MINUTE,
  build: Infinity,
};

export const detailQueryKey = (type, id) => ['anime-detail', type, id];

export const listQueryKey = (type, query, sort, providers, origin = '') =>
  ['anime', type, query ? { query } : { sort, providers, origin }];
