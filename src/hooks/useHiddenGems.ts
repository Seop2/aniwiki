import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchRecommendations } from "../lib/apiClient";
import { EXCLUDE_IDS, SEED_BY_ID } from "../data/seeds";
import { rankHiddenGems, type SeedList } from "../lib/discover";
import { STALE_TIME } from "../lib/queries";

const PAGES = [1, 2];

export function useHiddenGems(seedIds: number[], seenIds: number[]) {
  const pairs = seedIds.flatMap((id) => PAGES.map((page) => ({ id, page })));
  const results = useQueries({
    queries: pairs.map(({ id, page }) => ({
      queryKey: ["recs", "tv", id, page],
      queryFn: () => fetchRecommendations({ type: "tv", id, page }),
      staleTime: STALE_TIME.recommendations,
    })),
  });

  const isPending = results.some((r) => r.isPending);
  const isError = results.length > 0 && results.every((r) => r.isError);
  const dataKey = results.map((r) => r.dataUpdatedAt).join();
  const seenKey = seenIds.join();

  const gems = useMemo(() => {
    if (isPending) return [];
    const lists: SeedList[] = seedIds.map((id) => ({
      seed: SEED_BY_ID.get(id)!,
      items: pairs.flatMap((p, i) =>
        p.id === id ? (results[i].data ?? []) : [],
      ),
    }));
    return rankHiddenGems(lists, {
      exclude: new Set([...EXCLUDE_IDS, ...seenIds]),
    });
  }, [isPending, dataKey, seenKey, seedIds.join()]);

  return { gems, isPending, isError };
}
