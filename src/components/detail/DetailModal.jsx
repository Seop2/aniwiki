'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAnimeDetail } from '../../hooks/useAnimeDetail';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { overviewSummary } from '../../lib/media';
import Modal from '../common/Modal';
import { useAppState } from '../layout/AppState';
import DetailContent from './DetailContent';

/** 앱 안에서 연 상세(@modal 인터셉트 라우트). 닫으면 뒤로가기 — 브라우저 뒤로가기와 같은 결과 */
export default function DetailModal({ type, id }) {
  const router = useRouter();
  const { preview } = useAppState();
  const closing = useRef(false); // 닫기 연타로 back()이 두 번 불려 사이트를 벗어나지 않게

  const item = preview?.type === type && preview.item.id === id ? preview.item : undefined;

  // 모달은 Next metadata가 적용되지 않아 탭 제목 · 설명을 직접 바꾸고, 닫으면 되돌린다(본문과 같은 쿼리라 다시 요청하지 않음).
  // 상세 페이지(DetailPage)는 generateMetadata가 정한다
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
