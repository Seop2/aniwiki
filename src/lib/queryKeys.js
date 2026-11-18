export const detailQueryKey = (type, id) => ['anime-detail', type, id];

export const listQueryKey = (type, query, sort, providers) => ['anime', type, query ? { query } : { sort, providers }];
