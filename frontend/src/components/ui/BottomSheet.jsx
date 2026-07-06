import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '../../utils/cn';

function BottomSheet({ isOpen, title, eyebrow, children, onClose, className = '' }) {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
        style={{ animation: 'fadeIn 200ms ease-out' }}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 flex w-full flex-col rounded-t-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800',
          'max-h-[85vh] min-h-[40vh]',
          'animate-slide-up',
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/95">
          <div className="flex-1">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-400">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2
                className={cn(
                  'text-lg font-semibold text-slate-900 dark:text-slate-100',
                  eyebrow ? 'mt-1' : ''
                )}
              >
                {title}
              </h2>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:focus-visible:ring-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 300ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up { animation: none; }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default BottomSheet;
