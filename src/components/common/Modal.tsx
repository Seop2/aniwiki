import { type ReactNode, useEffect, useRef } from 'react';

export default function Modal({ className = '', labelledBy, onClose, children }: {
  className?: string;
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current!;
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
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
