import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { AnimeSummary, MediaType, NetflixOriginal, OriginKey, ProviderKey, SortKey } from '@/types';
import { fetchAnimePage, fetchNetflixOriginals } from '../lib/apiClient';
import { ORIGINS, SORTS, today } from '../lib/catalog';
import { listQueryKey, STALE_TIME } from '../lib/queries';

const ORIGINAL_MIN_VOTES = 200;

function originalItems(list: NetflixOriginal[], type: MediaType, sort: SortKey, origin: OriginKey | '') {
  let items = list.filter((x) => x.type === type);
  if (origin) items = items.filter((x) => (ORIGINS[origin].langs as string[]).includes(x.originalLanguage));
  if (sort === 'rating') items = items.filter((x) => x.votes >= ORIGINAL_MIN_VOTES);
  if (sort === 'latest') items = items.filter((x) => x.date && x.date <= today());
  return items.sort(SORTS[sort].compare);
}

export function useAnimeList({ type, sort, query, providers = [], original = false, origin = '' }: {
  type: MediaType;
  sort: SortKey;
  query: string;
  providers?: ProviderKey[];
  original?: boolean;
  origin?: OriginKey | '';
}) {
  const useOriginals = original && !query;

  const result = useInfiniteQuery({
    queryKey: listQueryKey(type, query, sort, providers, origin),
    queryFn: ({ pageParam }) => fetchAnimePage({ type, sort, query, providers, origin, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: STALE_TIME.list,
    enabled: !useOriginals,
  });

  const originals = useQuery({
    queryKey: ['netflix-originals'],
    queryFn: fetchNetflixOriginals,
    staleTime: STALE_TIME.build,
    enabled: useOriginals,
  });

  if (useOriginals) {
    const items = originals.data ? originalItems(originals.data, type, sort, origin) : [];
    return {
      items,
      total: items.length,
      isPending: originals.isPending,
      isError: originals.isError,
      error: originals.error,
      hasNextPage: false,
      fetchNextPage: () => {},
      isFetchingNextPage: false,
    };
  }

  const pages = result.data?.pages ?? [];
  let items: AnimeSummary[] = pages.flatMap((p) => p.items);
  if (query) items = [...items].sort(SORTS[sort].compare);

  const total = query ? items.length : (pages[0]?.totalResults ?? 0);

  return { ...result, items, total };
}
