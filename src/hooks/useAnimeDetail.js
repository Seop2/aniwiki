import { useQuery } from '@tanstack/react-query';
import { fetchAnimeDetail } from '../api/tmdb';
import { detailQueryKey } from '../lib/queryKeys';
import { STALE_TIME } from '../lib/staleTimes';

/** 작품 상세 쿼리 설정. 상세 모달 · 공유 TOP 10 · 숨은 명작 카드가 같은 캐시를 쓰도록 한 곳에서 만든다 */
export const animeDetailQuery = (type, id) => ({
  queryKey: detailQueryKey(type, id),
  queryFn: () => fetchAnimeDetail({ type, id }),
  staleTime: STALE_TIME.detail,
});

export function useAnimeDetail({ type, id }) {
  return useQuery({ ...animeDetailQuery(type, id), enabled: !!id });
}
