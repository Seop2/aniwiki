import { type ReactNode, useEffect, useRef } from "react";
import Icon from "./Icon";
import s from "./Modal.module.css";

export default function Modal({
  className = "",
  labelledBy,
  onClose,
  children,
}: {
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
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`${s.dialog} ${className}`.trim()}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="detail-inner">
        <button
          type="button"
          className={s.close}
          onClick={onClose}
          aria-label="닫기"
        >
          <Icon size={18}>
            <path d="M18 6 6 18M6 6l12 12" />
          </Icon>
        </button>
        {children}
      </div>
    </dialog>
  );
}
