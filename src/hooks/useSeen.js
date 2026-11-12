import { useEffect, useState } from 'react';

const SEEN_KEY = 'aniwiki-seen';
const PICKS_KEY = 'aniwiki-discover-picks';

function load(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved)) return saved.filter(Number.isInteger);
  } catch {}
  return [];
}

function usePersistedIds(key) {
  const [ids, setIds] = useState(() => load(key));
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(ids)); } catch {}
  }, [key, ids]);
  return [ids, setIds];
}

/** 「이미 봤어요」로 뺀 작품 ID (추천 결과에서 제외) */
export function useSeen() {
  const [ids, setIds] = usePersistedIds(SEEN_KEY);
  const add = (id) => setIds((s) => (s.includes(id) ? s : [...s, id]));
  return { ids, add };
}

/** /discover에서 마지막으로 고른 유명작 — 다음 방문 때 미리 선택해 둔다 */
export const useDiscoverPicks = () => usePersistedIds(PICKS_KEY);
