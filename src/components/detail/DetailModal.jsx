'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAnimeDetail } from '../../hooks/useAnimeDetail';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { overviewSummary } from '../../lib/media';
import Modal from '../common/Modal';
import { useAppState } from '../layout/AppState';
import DetailContent from './DetailContent';

export default function DetailModal({ type, id }) {
  const router = useRouter();
  const { preview } = useAppState();
  const closing = useRef(false);

  const item = preview?.type === type && preview.item.id === id ? preview.item : undefined;

  const { data } = useAnimeDetail({ type, id });
  const title = (data ?? item)?.title;
  useDocumentMeta({ title: title && `${title} - ANIWIKI`, description: overviewSummary(data?.overview) });

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    router.back();
  };

  return (
    <Modal labelledBy="detail-title" onClose={close}>
      <DetailContent type={type} id={id} item={item} />
    </Modal>
  );
}
