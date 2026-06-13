import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '../../utils/cn';
import Button from './Button';

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
  bodyClassName = ''
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

  if (!visible) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn(
          'flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800',
          maxWidth,
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/95 md:px-6 md:py-5">
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

        <div className={cn('scrollbar-none min-h-0 flex-1 overflow-y-auto bg-white px-5 py-4 dark:bg-slate-800 md:px-6', bodyClassName)}>{children}</div>

        {footer ? (
          <div className="border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/95 md:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

export default FormModal;
