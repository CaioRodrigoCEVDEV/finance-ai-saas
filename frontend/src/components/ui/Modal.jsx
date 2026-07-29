import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '../../utils/cn';
import Button from './Button';

function Modal({ isOpen, title, eyebrow, description, children, footer, onClose, className = '', bodyClassName = '' }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => {
      if (!dialogRef.current?.contains(document.activeElement)) dialogRef.current?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (document.activeElement === dialogRef.current) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn('flex h-[100dvh] max-h-none w-full flex-col overflow-hidden rounded-none border-0 bg-surface p-0 shadow-none outline-none sm:h-auto sm:max-h-[88vh] sm:rounded-[22px] sm:border sm:border-border-ui sm:shadow-floating', className || 'sm:max-w-2xl')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border-soft bg-surface/95 px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur sm:pt-4 md:px-6 md:py-5">
          <div>
            {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p> : null}
            <h2 id={titleId} className={cn(eyebrow ? 'mt-2 text-xl font-bold leading-tight text-content-primary md:text-2xl' : 'text-lg font-semibold text-content-primary md:text-xl')}>
              {title}
            </h2>
            {!eyebrow && description ? <p className="mt-1 text-sm text-content-secondary">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar modal" className="h-9 w-9 rounded-full p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface px-5 py-4 md:px-6', bodyClassName)}>{children}</div>
        {footer ? <div className="border-t border-border-soft bg-surface/95 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:pb-4 md:px-6">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
