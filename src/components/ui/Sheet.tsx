import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Sheet.module.css";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
  /** Prevent closing by tapping the backdrop (e.g. the consent sheet). */
  modal?: boolean;
}

/** Mobile bottom sheet with backdrop, Escape to close and swipe-down to dismiss. */
export function Sheet({ open, onClose, children, label, modal = false }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !modal) closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open, modal]);

  if (!open || typeof document === "undefined") return null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (modal) return;
    drag.current = { y: e.clientY, dy: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !panel.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    panel.current.style.transform = `translateY(${drag.current.dy}px)`;
  };
  const onPointerUp = () => {
    if (!drag.current || !panel.current) return;
    const dismissed = drag.current.dy > 90;
    panel.current.style.transform = "";
    drag.current = null;
    if (dismissed) onClose();
  };

  return createPortal(
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={modal ? undefined : onClose} />
      <div ref={panel} className={styles.panel} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        <div
          className={styles.handleArea}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className={styles.handle} />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
