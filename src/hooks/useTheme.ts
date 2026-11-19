import { useSyncExternalStore } from "react";
import { THEME_KEY } from "../lib/theme";

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const current = () => document.documentElement.dataset.theme ?? "dark";

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, current, () => "dark");

  const toggle = () => {
    const next = current() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    listeners.forEach((fn) => fn());
  };
  return { theme, toggle };
}
