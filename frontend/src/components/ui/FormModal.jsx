import { useEffect } from 'react';
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

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible || !fullScreenOnMobile) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible, fullScreenOnMobile]);

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
        className={cn(
          fullScreenOnMobile
            ? 'flex h-screen h-[100dvh] max-h-none w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-white shadow-none dark:bg-slate-800 sm:h-auto sm:max-h-[88vh] sm:max-w-[var(--form-modal-max-width)] sm:rounded-2xl sm:border sm:shadow-2xl'
            : `flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 ${maxWidth}`,
          className
        )}
        style={fullScreenOnMobile ? { '--form-modal-max-width': FORM_MODAL_MAX_WIDTHS[maxWidth] || '56rem' } : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={cn(
          'sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/95 md:px-6 md:py-5',
          fullScreenOnMobile && 'pl-[calc(1.25rem+env(safe-area-inset-left))] pr-[calc(1.25rem+env(safe-area-inset-right))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-5 sm:pt-4'
        )}>
          <div className="flex items-start justify-between gap-4">
            <div>
              {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500 dark:text-emerald-400">{eyebrow}</p> : null}
              <h2 className={cn('font-bold leading-tight text-slate-900 dark:text-slate-100', eyebrow ? 'mt-2 text-xl md:text-2xl' : 'text-xl')}>
                {title}
              </h2>
            </div>

            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar modal" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={cn(
          'scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-5 py-4 dark:bg-slate-800 md:px-6',
          fullScreenOnMobile && 'pl-[calc(1.25rem+env(safe-area-inset-left))] pr-[calc(1.25rem+env(safe-area-inset-right))] sm:px-5 md:px-6',
          bodyClassName
        )}>{children}</div>

        {footer ? (
          <div className={cn(
            'border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/95 md:px-6',
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
