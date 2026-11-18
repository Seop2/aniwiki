import { useQuery } from '@tanstack/react-query';
import { fetchAnimeDetail } from '../lib/apiClient';
import { detailQueryKey, STALE_TIME } from '../lib/queries';

export const animeDetailQuery = (type, id) => ({
  queryKey: detailQueryKey(type, id),
  queryFn: () => fetchAnimeDetail({ type, id }),
  staleTime: STALE_TIME.detail,
});

export function useAnimeDetail({ type, id }) {
  return useQuery({ ...animeDetailQuery(type, id), enabled: !!id });
}
