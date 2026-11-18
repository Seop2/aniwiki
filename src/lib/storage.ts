import { useCallback, useMemo, useSyncExternalStore } from 'react';

const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function readRaw(key: string) {
  if (memory.has(key)) return memory.get(key)!;
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeRaw(key: string, raw: string) {
  memory.set(key, raw);
  try { localStorage.setItem(key, raw); } catch {}
  listeners.forEach((fn) => fn());
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

function parse<T>(raw: string | null, read: (saved: unknown) => T | undefined) {
  try { return raw == null ? undefined : read(JSON.parse(raw)); } catch { return undefined; }
}

export function useStoredValue<T>(key: string, read: (saved: unknown) => T | undefined, fallback: T) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const value = useMemo(() => parse(raw, read) ?? fallback, [raw]);

  const setValue = useCallback((next: T | ((current: T) => T)) => {
    const current = parse(readRaw(key), read) ?? fallback;
    writeRaw(key, JSON.stringify(typeof next === 'function' ? (next as (current: T) => T)(current) : next));
  }, [key]);

  return [value, setValue] as const;
}
