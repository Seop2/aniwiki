import { useEffect, useRef } from 'react';

/** 작품 상세 · 내 TOP 10이 함께 쓰는 모달 틀. Esc · 백드롭 클릭 · 닫기 버튼 모두 onClose로 */
export default function Modal({ className = '', labelledBy, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    // close()는 부르지 않는다 — StrictMode 재실행 시 close 이벤트가 onClose를 불러 모달이 바로 닫힌다.
    // 언마운트로 DOM에서 빠지면 모달 상태도 함께 해제된다.
    if (!dialog.open) dialog.showModal();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`detail ${className}`.trim()}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()} // 백드롭 클릭
    >
      <div className="detail-inner">
        <button type="button" className="detail-close" onClick={onClose} aria-label="닫기">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        {children}
      </div>
    </dialog>
  );
}
