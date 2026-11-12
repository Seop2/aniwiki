import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchRecommendations } from '../api/tmdb';
import { EXCLUDE_IDS, SEED_BY_ID } from '../data/seeds';
import { rankHiddenGems } from '../lib/discover';

const PAGES = [1, 2]; // 시드마다 추천 40편

/** 고른 유명작들의 TMDB 추천을 합산해 숨은 명작 순위를 낸다. 일부 요청이 실패해도 성공한 것만으로 계산 */
export function useHiddenGems(seedIds, seenIds) {
  const pairs = seedIds.flatMap((id) => PAGES.map((page) => ({ id, page })));
  const results = useQueries({
    queries: pairs.map(({ id, page }) => ({
      queryKey: ['recs', 'tv', id, page],
      queryFn: () => fetchRecommendations({ type: 'tv', id, page }),
      staleTime: 1000 * 60 * 60,
    })),
  });

  const isPending = results.some((r) => r.isPending);
  const isError = results.length > 0 && results.every((r) => r.isError);
  const dataKey = results.map((r) => r.dataUpdatedAt).join();
  const seenKey = seenIds.join();

  const gems = useMemo(() => {
    if (isPending) return [];
    const lists = seedIds.map((id) => ({
      seed: SEED_BY_ID.get(id),
      items: pairs.flatMap((p, i) => (p.id === id ? results[i].data ?? [] : [])),
    }));
    return rankHiddenGems(lists, { exclude: new Set([...EXCLUDE_IDS, ...seenIds]) });
  }, [isPending, dataKey, seenKey, seedIds.join()]);

  return { gems, isPending, isError };
}
