import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '../../utils/cn';
import Button from './Button';

function Modal({ isOpen, title, eyebrow, description, children, footer, onClose, className = '', bodyClassName = '' }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={cn('flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl dark:border-slate-700 dark:bg-slate-800', className || 'max-w-2xl')} onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/95 md:px-6 md:py-5">
          <div>
            {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-400">{eyebrow}</p> : null}
            <h2 className={cn(eyebrow ? 'mt-2 text-xl font-bold leading-tight text-slate-900 dark:text-slate-100 md:text-2xl' : 'text-lg font-semibold text-slate-900 dark:text-slate-100 md:text-xl')}>
              {title}
            </h2>
            {!eyebrow && description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn('scrollbar-none min-h-0 flex-1 overflow-y-auto bg-white px-5 py-4 dark:bg-slate-800 md:px-6', bodyClassName)}>{children}</div>
        {footer ? <div className="border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/95 md:px-6">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
