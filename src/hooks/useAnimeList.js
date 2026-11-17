import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchAnimePage, SORTS } from '../api/tmdb';
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

/** ready: 저장된 시청처를 읽은 뒤(하이드레이션 뒤)에만 요청한다 — 빈 시청처로 한 번 받고 다시 받지 않게 */
export function useAnimeList({ type, sort, query, providers = [], original = false, ready = true }) {
  const useOriginals = original && !query;

  const result = useInfiniteQuery({
    queryKey: ['anime', type, query ? { query } : { sort, providers }],
    queryFn: ({ pageParam }) => fetchAnimePage({ type, sort, query, providers, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: STALE_TIME.list,
    enabled: ready && !useOriginals,
  });

  const originals = useNetflixOriginals({ enabled: ready && useOriginals });

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
