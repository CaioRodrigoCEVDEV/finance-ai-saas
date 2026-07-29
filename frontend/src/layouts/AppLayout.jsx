import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import BottomNavigation from '../components/layout/BottomNavigation';
import MobileTopbar from '../components/layout/MobileTopbar';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import QuickAddHub from '../components/quickadd/QuickAddHub';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddAction, setQuickAddAction] = useState(null);
  const { tenant } = useAuth();
  const canWrite = tenant?.role !== 'READONLY';
  const drawerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => drawerRef.current?.focus());

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }

      if (event.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (document.activeElement === drawerRef.current) {
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
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [mobileMenuOpen]);

  function openQuickAdd(action = null) {
    if (!canWrite) return;
    setQuickAddAction(action);
    setQuickAddOpen(true);
  }

  function handleQuickAddOpenChange(open) {
    setQuickAddOpen(open);
    if (!open) setQuickAddAction(null);
  }

  return (
    <div className="min-h-[100dvh] text-content-primary transition-colors">
      <div className="w-full lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-7 lg:p-4 xl:grid-cols-[244px_minmax(0,1fr)] xl:gap-8">
        <div className="relative z-20 hidden h-[calc(100dvh-2rem)] min-h-[620px] overflow-hidden lg:sticky lg:top-4 lg:block">
          <Sidebar />
        </div>

        <section className="relative z-10 min-w-0">
          <div className="pointer-events-none sticky top-0 z-30 hidden pb-4 pt-1 lg:block">
            <div className="pointer-events-auto">
              <Topbar />
            </div>
          </div>

          <div className="pointer-events-none sticky top-0 z-30 px-3 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 lg:hidden">
            <div className="pointer-events-auto">
              <MobileTopbar />
            </div>
          </div>

          <main className="min-w-0">
            <div className="min-w-0 space-y-6 px-3 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:px-5 lg:px-0 lg:pb-8">
              {typeof children === 'function' ? children({ openQuickAdd }) : children}
            </div>
          </main>
        </section>
      </div>

      {canWrite ? (
        <QuickAddHub
          open={quickAddOpen}
          initialAction={quickAddAction}
          onOpenChange={handleQuickAddOpenChange}
        />
      ) : null}
      <BottomNavigation
        onMoreClick={() => setMobileMenuOpen(true)}
        onQuickAdd={() => openQuickAdd()}
        canQuickAdd={canWrite}
      />

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!mobileMenuOpen}
        inert={mobileMenuOpen ? undefined : ''}
      >
        <button
          type="button"
          className="absolute inset-0 h-full w-full bg-slate-950/40 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fechar menu"
        />

        <div
          ref={drawerRef}
          tabIndex={-1}
          className={cn(
            'absolute inset-0 w-full outline-none transition-transform duration-300 ease-out',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <Sidebar mobile onNavigate={() => setMobileMenuOpen(false)} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-5 top-[calc(1.25rem+env(safe-area-inset-top))] flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
