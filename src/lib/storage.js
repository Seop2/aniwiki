import { useCallback, useMemo, useSyncExternalStore } from 'react';

// localStorage 값을 React 상태처럼 쓴다. 서버 렌더와 첫 하이드레이션에는 기본값을 그리고, 그다음 저장값으로 바뀐다
// (초기 state에서 바로 읽으면 서버 HTML과 달라 하이드레이션 오류가 난다).
// 저장이 막힌 브라우저(사생활 보호 모드 등)에서도 이 탭 안에서는 값이 유지되도록 메모리에도 둔다
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

/** read: 저장된 JSON → 값(형식이 틀리면 undefined). fallback은 모듈 상수처럼 바뀌지 않는 값이어야 한다 */
export function useStoredValue(key, read, fallback) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const value = useMemo(() => parse(raw, read) ?? fallback, [raw]);

  const setValue = useCallback((next) => {
    const current = parse(readRaw(key), read) ?? fallback;
    writeRaw(key, JSON.stringify(typeof next === 'function' ? next(current) : next));
  }, [key]);

  return [value, setValue];
}
