'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../common/Modal';
import { useAppState } from '../layout/AppState';
import DetailContent from './DetailContent';

/** 앱 안에서 연 상세(@modal 인터셉트 라우트). 닫으면 뒤로가기 — 브라우저 뒤로가기와 같은 결과 */
export default function DetailModal({ type, id }) {
  const router = useRouter();
  const { preview } = useAppState();
  const closing = useRef(false); // 닫기 연타로 back()이 두 번 불려 사이트를 벗어나지 않게

  const item = preview?.type === type && preview.item.id === id ? preview.item : undefined;

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
