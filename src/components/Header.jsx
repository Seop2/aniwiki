import { useTheme } from '../hooks/useTheme';

export default function Header({ top10Count, onOpenTop10, onOpenDiscover }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <span className="brand"><i className="brand-box" aria-hidden />ANIME / INDEX</span>
        <div className="topbar-actions">
          <button type="button" className="btn-outline" onClick={onOpenDiscover} aria-label="숨은 명작 찾기">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>
            <span className="discover-label">숨은 명작</span>
          </button>
          <button type="button" className="btn-outline btn-top10" onClick={onOpenTop10}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/></svg>
            내 TOP 10 <span className="top10-count">{top10Count}/10</span>
          </button>
          <button type="button" className="btn-outline" onClick={toggle} aria-label={isDark ? '라이트 모드' : '다크 모드'}>
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
            )}
            <span className="theme-label">{isDark ? '라이트 모드' : '다크 모드'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
