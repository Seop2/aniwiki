import { useQuery } from '@tanstack/react-query';
import { fetchNetflixOriginals } from '../api/tmdb';

/** 빌드 때 고정된 목록이라 한 번 받으면 다시 요청하지 않는다 */
export const useNetflixOriginals = ({ enabled }) =>
  useQuery({ queryKey: ['netflix-originals'], queryFn: fetchNetflixOriginals, staleTime: Infinity, enabled });
