import { X } from 'lucide-react';
import { useState } from 'react';

import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Button from '../components/ui/Button';

function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto grid min-h-screen w-full max-w-content grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6 lg:px-8">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <div className="sticky top-0 z-20 lg:hidden">
            <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
          </div>

          <div className="sticky top-4 z-40 hidden lg:block">
            <Topbar />
          </div>

          <main className="min-w-0 pb-8">{children}</main>
        </div>
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
