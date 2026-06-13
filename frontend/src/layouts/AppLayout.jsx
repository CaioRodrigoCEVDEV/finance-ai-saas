import { X } from 'lucide-react';
import { useState } from 'react';

import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Button from '../components/ui/Button';

function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto flex min-h-screen w-full max-w-content flex-col gap-4 px-4 py-4 sm:px-6 lg:h-screen lg:flex-row lg:overflow-hidden lg:px-8">
        <div className="hidden w-72 shrink-0 lg:block lg:self-stretch">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:min-h-0 lg:overflow-hidden lg:py-4">
          <div className="lg:hidden">
            <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
          </div>

          <div className="hidden lg:block">
            <Topbar />
          </div>

          <main className="flex-1 min-w-0 lg:min-h-0 lg:overflow-y-auto">{children}</main>
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
