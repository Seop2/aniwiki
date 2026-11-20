import Link from "next/link";
import Icon from "@/components/common/Icon";
import { useTheme } from "@/hooks/useTheme";
import { TOP10_MAX } from "@/lib/share";
import { useTop10Store } from "@/stores/top10";
import { useUiStore } from "@/stores/ui";
import s from "./Header.module.css";

export default function Header() {
  const openTop10 = useUiStore((s) => s.openTop10);
  const count = useTop10Store((s) => s.items.length);
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className={s.topbar}>
      <div className={`container ${s.inner}`}>
        <Link href="/">
          <span className={s.brand}>
            <i className={s.brandBox} aria-hidden />
            ANIME / INDEX
          </span>
        </Link>
        <div className={s.actions}>
          <Link
            className="btn-outline"
            href="/discover"
            aria-label="숨은 명작 찾기"
          >
            <Icon>
              <circle cx="12" cy="12" r="9" />
              <path d="m15.5 8.5-2 5-5 2 2-5z" />
            </Icon>
            <span className={s.label}>숨은 명작</span>
          </Link>
          <button type="button" className="btn-outline" onClick={openTop10}>
            <Icon>
              <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" />
            </Icon>
            내 TOP 10{" "}
            <span className={s.count}>
              {count}/{TOP10_MAX}
            </span>
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={toggle}
            aria-label={isDark ? "라이트 모드" : "다크 모드"}
          >
            <Icon>
              {isDark ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </>
              ) : (
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              )}
            </Icon>
            <span className={s.label}>
              {isDark ? "라이트 모드" : "다크 모드"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
