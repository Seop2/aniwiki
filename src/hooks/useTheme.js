import { useSyncExternalStore } from 'react';
import { THEME_KEY } from '../lib/theme';

const listeners = new Set();
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const current = () => document.documentElement.dataset.theme ?? 'dark';

/** <html data-theme>이 기준. 서버 렌더와 첫 하이드레이션에는 다크로 그리고 바로 실제 값으로 바뀐다 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, current, () => 'dark');

  const toggle = () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    listeners.forEach((fn) => fn());
  };
  return { theme, toggle };
}
