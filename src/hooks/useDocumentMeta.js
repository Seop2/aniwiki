import { useEffect } from 'react';

const ORIGIN = 'https://www.aniwiki.link';

/** 화면이 떠 있는 동안 탭 제목 · 검색 설명을 바꾸고, 사라지면 이전 값으로 되돌린다. 값이 없으면 건드리지 않는다 */
export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);

  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    if (!meta || !description) return;
    const prev = meta.content;
    meta.content = description;
    return () => { meta.content = prev; };
  }, [description]);
}

/** index.html에 고정하면 모든 주소가 /의 중복으로 취급돼 작품 상세가 색인되지 않는다 */
export function useCanonical(path) {
  useEffect(() => {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.append(link);
    }
    link.href = `${ORIGIN}${path}`;
  }, [path]);
}
