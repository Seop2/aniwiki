import { MEDIA } from './media';

// 화면별 주소. 화면마다 주소가 있어야 Vercel Analytics(무료 플랜)에서 페이지별로 집계된다
//   /                      랭킹
//   /top10?top10=…&name=…  공유된 TOP 10
//   /anime/tv/1429         작품 상세(앱 안에서 열면 모달, 바로 들어오면 페이지)
//   /discover?seen=…       숨은 명작 찾기
export const detailPath = (type, id) => `/anime/${type}/${id}`;

/** 주소의 type · id가 올바르면 { type, id(숫자) }, 아니면 null */
export function parseDetailParams(type, id) {
  return Object.hasOwn(MEDIA, type) && /^\d{1,9}$/.test(id) ? { type, id: Number(id) } : null;
}

/** 페이지 searchParams 객체 → URLSearchParams (같은 키가 여러 번이면 첫 값) */
export const toSearchParams = (params) =>
  new URLSearchParams(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

/** 새 탭 열기(⌘/Ctrl/Shift 클릭, 휠 클릭)인지 — 이때는 화면 상태를 건드리지 않는다 */
export const isPlainClick = (e) => e.button === 0 && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
