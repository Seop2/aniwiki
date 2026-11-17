import { useEffect } from 'react';

/** 모달(작품 상세)이 떠 있는 동안 — 페이지는 Next metadata로 정한다. 탭 제목 · 검색 설명을 바꾸고, 사라지면 이전 값으로 되돌린다. 값이 없으면 건드리지 않는다 */
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
