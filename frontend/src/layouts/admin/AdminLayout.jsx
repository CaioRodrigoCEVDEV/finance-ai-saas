import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import AdminSidebar from '../../components/admin/AdminSidebar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto flex min-h-screen w-full max-w-content flex-col gap-4 px-4 py-4 sm:px-6 lg:h-screen lg:flex-row lg:overflow-hidden lg:px-8">
        <div className="hidden w-72 shrink-0 lg:block lg:self-stretch">
          <AdminSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:min-h-0 lg:overflow-hidden lg:py-4">
          <header className="flex items-center justify-between rounded-[28px] border border-amber-200 bg-white px-4 py-4 shadow-soft dark:border-amber-800 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="Abrir menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-400">Painel Administrativo</p>
                <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {user?.name ? `Logado como ${user.name}` : 'Super Admin'}
                </p>
              </div>
            </div>
          </header>

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
              <AdminSidebar mobile onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AdminLayout;
