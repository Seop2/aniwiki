import { useStoredValue } from '../lib/storage';

const SEEN_KEY = 'aniwiki-seen';
const PICKS_KEY = 'aniwiki-discover-picks';
const EMPTY: never[] = [];

export function usePersistedIds<T = number>(key: string, isValid: (id: unknown) => boolean = Number.isInteger) {
  return useStoredValue<T[]>(key, (saved) => (Array.isArray(saved) ? saved.filter(isValid) : undefined), EMPTY);
}

export function useSeen() {
  const [ids, setIds] = usePersistedIds(SEEN_KEY);
  const add = (id: number) => setIds((s) => (s.includes(id) ? s : [...s, id]));
  return { ids, add };
}

export const useDiscoverPicks = () => usePersistedIds(PICKS_KEY);
