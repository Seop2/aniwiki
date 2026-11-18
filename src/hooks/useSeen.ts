import { useStoredValue } from '../lib/storage';

const SEEN_KEY = 'aniwiki-seen';
const PICKS_KEY = 'aniwiki-discover-picks';
const EMPTY: number[] = [];

export function usePersistedIds(key: string, isValid: (id: unknown) => boolean = Number.isInteger) {
  return useStoredValue(key, (saved) => (Array.isArray(saved) ? (saved.filter(isValid) as number[]) : undefined), EMPTY);
}

export function useSeen() {
  const [ids, setIds] = usePersistedIds(SEEN_KEY);
  const add = (id: number) => setIds((s) => (s.includes(id) ? s : [...s, id]));
  return { ids, add };
}

export const useDiscoverPicks = () => usePersistedIds(PICKS_KEY);
