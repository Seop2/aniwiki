import { useEffect } from 'react';

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
