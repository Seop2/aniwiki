import { useStoredValue } from '../lib/storage';

const SEEN_KEY = 'aniwiki-seen';
const PICKS_KEY = 'aniwiki-discover-picks';
const EMPTY = [];

/** localStorage에 저장되는 값 목록. isValid로 저장값을 검증한다(기본: 작품 ID) */
export function usePersistedIds(key, isValid = Number.isInteger) {
  return useStoredValue(key, (saved) => (Array.isArray(saved) ? saved.filter(isValid) : undefined), EMPTY);
}

/** 「이미 봤어요」로 뺀 작품 ID (추천 결과에서 제외) */
export function useSeen() {
  const [ids, setIds] = usePersistedIds(SEEN_KEY);
  const add = (id) => setIds((s) => (s.includes(id) ? s : [...s, id]));
  return { ids, add };
}

/** /discover에서 마지막으로 고른 유명작 — 다음 방문 때 미리 선택해 둔다 */
export const useDiscoverPicks = () => usePersistedIds(PICKS_KEY);
