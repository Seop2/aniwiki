import { useQuery } from '@tanstack/react-query';
import { fetchNetflixOriginals } from '../lib/apiClient';
import { STALE_TIME } from '../lib/staleTimes';

export const useNetflixOriginals = ({ enabled }) =>
  useQuery({ queryKey: ['netflix-originals'], queryFn: fetchNetflixOriginals, staleTime: STALE_TIME.build, enabled });
