import { X } from 'lucide-react';
import { useState } from 'react';

import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Button from '../components/ui/Button';

function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto flex h-full w-full max-w-content gap-5 overflow-hidden px-4 py-5 sm:px-6 lg:gap-6 lg:px-6 xl:px-8">
        <div className="hidden h-full w-72 shrink-0 overflow-hidden lg:block">
          <Sidebar />
        </div>

        <section className="relative min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-30">
            <div className="pointer-events-auto">
              <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
            </div>
          </div>

          <main className="scrollbar-none h-full min-w-0 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto min-w-0 max-w-[1400px] space-y-7 pb-10 pt-[112px]">{children}</div>
          </main>
        </section>
      </div>

      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="flex h-full max-w-xs flex-col overflow-hidden p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex shrink-0 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
                Fechar
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <Sidebar mobile onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AppLayout;
