import { useQuery } from '@tanstack/react-query';
import { fetchAnimeDetail } from '../api/tmdb';

export function useAnimeDetail({ type, id }) {
  return useQuery({
    queryKey: ['anime-detail', type, id],
    queryFn: () => fetchAnimeDetail({ type, id }),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}
