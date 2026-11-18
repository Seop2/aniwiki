import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchAnimePage } from '../lib/apiClient';
import { SORTS } from '../lib/catalog';
import { listQueryKey } from '../lib/queryKeys';
import { STALE_TIME } from '../lib/staleTimes';
import { useNetflixOriginals } from './useNetflixOriginals';

const ORIGINAL_MIN_VOTES = 200;
const today = () => new Date().toISOString().slice(0, 10);

function originalItems(list, type, sort) {
  let items = list.filter((x) => x.type === type);
  if (sort === 'rating') items = items.filter((x) => x.votes >= ORIGINAL_MIN_VOTES);
  if (sort === 'latest') items = items.filter((x) => x.date && x.date <= today());
  return items.sort(SORTS[sort].compare);
}

export function useAnimeList({ type, sort, query, providers = [], original = false }) {
  const useOriginals = original && !query;

  const result = useInfiniteQuery({
    queryKey: listQueryKey(type, query, sort, providers),
    queryFn: ({ pageParam }) => fetchAnimePage({ type, sort, query, providers, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: STALE_TIME.list,
    enabled: !useOriginals,
  });

  const originals = useNetflixOriginals({ enabled: useOriginals });

  if (useOriginals) {
    const items = originals.data ? originalItems(originals.data, type, sort) : [];
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
  let items = pages.flatMap((p) => p.items);
  if (query) items = [...items].sort(SORTS[sort].compare);

  const total = query ? items.length : (pages[0]?.totalResults ?? 0);

  return { ...result, items, total };
}
