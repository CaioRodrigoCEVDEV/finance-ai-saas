import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '../../utils/cn';
import Button from './Button';

const FORM_MODAL_MAX_WIDTHS = {
  'max-w-lg': '32rem',
  'max-w-2xl': '42rem',
  'max-w-4xl': '56rem'
};

function FormModal({
  open,
  isOpen,
  onClose,
  eyebrow,
  title,
  children,
  footer,
  maxWidth = 'max-w-4xl',
  className = '',
  bodyClassName = '',
  fullScreenOnMobile = true
}) {
  const visible = open ?? isOpen;
  const titleId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement;
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
      previousFocusRef.current?.focus?.();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        fullScreenOnMobile
          ? 'fixed inset-0 z-50 flex items-stretch justify-stretch bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm'
      )}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          fullScreenOnMobile
            ? 'flex h-screen h-[100dvh] max-h-none w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-surface shadow-none outline-none sm:h-auto sm:max-h-[88vh] sm:max-w-[var(--form-modal-max-width)] sm:rounded-[22px] sm:border sm:border-border-ui sm:shadow-floating'
            : `flex max-h-[88vh] w-full flex-col overflow-hidden rounded-[22px] border border-border-ui bg-surface shadow-floating outline-none ${maxWidth}`,
          className
        )}
        style={fullScreenOnMobile ? { '--form-modal-max-width': FORM_MODAL_MAX_WIDTHS[maxWidth] || '56rem' } : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={cn(
          'sticky top-0 z-10 border-b border-border-soft bg-surface/95 px-5 py-4 backdrop-blur md:px-6 md:py-5',
          fullScreenOnMobile && 'pl-[calc(1.25rem+env(safe-area-inset-left))] pr-[calc(1.25rem+env(safe-area-inset-right))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-5 sm:pt-4'
        )}>
          <div className="flex items-start justify-between gap-4">
            <div>
              {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p> : null}
              <h2 id={titleId} className={cn('font-bold leading-tight text-content-primary', eyebrow ? 'mt-2 text-xl md:text-2xl' : 'text-xl')}>
                {title}
              </h2>
            </div>

            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar modal" className="h-9 w-9 rounded-full p-0 text-content-secondary hover:text-content-primary">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface px-5 py-4 md:px-6',
          fullScreenOnMobile && 'pl-[calc(1.25rem+env(safe-area-inset-left))] pr-[calc(1.25rem+env(safe-area-inset-right))] sm:px-5 md:px-6',
          bodyClassName
        )}>{children}</div>

        {footer ? (
          <div className={cn(
            'border-t border-border-soft bg-surface/95 px-5 py-4 backdrop-blur md:px-6',
            fullScreenOnMobile && 'pl-[calc(1.25rem+env(safe-area-inset-left))] pr-[calc(1.25rem+env(safe-area-inset-right))] pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5 sm:pb-4 md:px-6'
          )}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

export default FormModal;
