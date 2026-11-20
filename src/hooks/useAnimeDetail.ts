import { useQuery } from "@tanstack/react-query";
import type { DetailParams, MediaType } from "@/types";
import { fetchAnimeDetail } from "@/lib/apiClient";
import { detailQueryKey, STALE_TIME } from "@/lib/queries";

export const animeDetailQuery = (type: MediaType, id: number) => ({
  queryKey: detailQueryKey(type, id),
  queryFn: () => fetchAnimeDetail({ type, id }),
  staleTime: STALE_TIME.detail,
});

export function useAnimeDetail({ type, id }: DetailParams) {
  return useQuery({ ...animeDetailQuery(type, id), enabled: !!id });
}
