import { useEffect, useState } from 'react';
import { parseShareUrl } from './share';

// 라이브러리 없는 최소 라우터. 화면마다 주소가 있어야 Vercel Analytics(무료 플랜)에서 페이지별로 집계된다
//   /                      랭킹
//   /top10?top10=…&name=…  공유된 TOP 10
//   /anime/tv/1429         작품 상세(모달)
const DETAIL_RE = /^\/anime\/(tv|movie)\/(\d{1,9})$/;

export const detailPath = (type, id) => `/anime/${type}/${id}`;

export function parseRoute(pathname, search) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/top10' || path === '/') {
    const shared = parseShareUrl(search);
    if (shared) return { name: 'shared', shared };
  }
  const m = DETAIL_RE.exec(path);
  if (m) return { name: 'detail', type: m[1], id: Number(m[2]) };
  return { name: 'home' };
}

/** Analytics의 route(같은 화면끼리 묶이는 이름) */
export const analyticsRoute = (route) =>
  ({ home: '/', shared: '/top10', detail: '/anime/[type]/[id]' })[route.name];

/** 새 탭 열기(⌘/Ctrl/Shift 클릭, 휠 클릭)는 브라우저 기본 동작에 맡긴다 */
export const isPlainClick = (e) => e.button === 0 && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);

const current = () => ({ pathname: location.pathname, search: location.search, state: history.state });

/** 예전 공유 링크(/?top10=…)는 /top10으로, 알 수 없는 경로는 /로 — 첫 페이지뷰 전에 주소를 바로잡는다 */
function normalize() {
  const { pathname, search } = location;
  const route = parseRoute(pathname, search);
  if (route.name === 'shared' && pathname !== '/top10') history.replaceState(null, '', `/top10${search}`);
  else if (route.name === 'home' && pathname !== '/') history.replaceState(null, '', pathname === '/top10' ? '/' : `/${search}`);
  return current();
}

export function useRoute() {
  const [loc, setLoc] = useState(normalize);

  useEffect(() => {
    const onPop = () => setLoc(current());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (url, { replace = false, state = null } = {}) => {
    history[replace ? 'replaceState' : 'pushState'](state, '', url);
    setLoc(current());
  };

  return { loc, route: parseRoute(loc.pathname, loc.search), navigate };
}
