import { useCallback, useMemo, useSyncExternalStore } from 'react';

const memory = new Map();
const listeners = new Set();

function readRaw(key) {
  if (memory.has(key)) return memory.get(key);
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeRaw(key, raw) {
  memory.set(key, raw);
  try { localStorage.setItem(key, raw); } catch {}
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function parse(raw, read) {
  try { return raw == null ? undefined : read(JSON.parse(raw)); } catch { return undefined; }
}

export function useStoredValue(key, read, fallback) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const value = useMemo(() => parse(raw, read) ?? fallback, [raw]);

  const setValue = useCallback((next) => {
    const current = parse(readRaw(key), read) ?? fallback;
    writeRaw(key, JSON.stringify(typeof next === 'function' ? next(current) : next));
  }, [key]);

  return [value, setValue];
}
