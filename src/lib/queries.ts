import type { MediaType, OriginKey, ProviderKey, SortKey } from "@/types";

const MINUTE = 60 * 1000;

export const STALE_TIME = {
  list: 10 * MINUTE,
  detail: 10 * MINUTE,
  recommendations: 60 * MINUTE,
  build: Infinity,
};

export const detailQueryKey = (type: MediaType, id: number) => [
  "anime-detail",
  type,
  id,
];

export const listQueryKey = (
  type: MediaType,
  query: string,
  sort: SortKey,
  providers: ProviderKey[],
  origin: OriginKey | "" = "",
) => ["anime", type, query ? { query } : { sort, providers, origin }];
