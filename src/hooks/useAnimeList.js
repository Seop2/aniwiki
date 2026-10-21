import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchAnimePage, SORTS } from '../api/tmdb';

export function useAnimeList({ type, sort, query }) {
  const result = useInfiniteQuery({
    // 검색 모드는 정렬을 클라이언트에서 하므로 sort를 키에 넣지 않는다 (불필요한 재요청 방지)
    queryKey: ['anime', type, query ? { query } : { sort }],
    queryFn: ({ pageParam }) => fetchAnimePage({ type, sort, query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 1000 * 60 * 10,
  });

  const pages = result.data?.pages ?? [];
  let items = pages.flatMap((p) => p.items);
  if (query) items = [...items].sort(SORTS[sort].compare);

  const total = query ? items.length : (pages[0]?.totalResults ?? 0);

  return { ...result, items, total };
}
