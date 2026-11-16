import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchAnimePage, SORTS } from '../api/tmdb';
import { useNetflixOriginals } from './useNetflixOriginals';

// 넷플릭스 오리지널 목록은 클라이언트에서 정렬한다. 평점순은 일반 랭킹(SORTS.rating)과 같은 200표 기준
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
    // 검색 모드는 정렬 · 시청처를 쓰지 않으므로 키에 넣지 않는다 (불필요한 재요청 방지)
    queryKey: ['anime', type, query ? { query } : { sort, providers }],
    queryFn: ({ pageParam }) => fetchAnimePage({ type, sort, query, providers, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 1000 * 60 * 10,
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
