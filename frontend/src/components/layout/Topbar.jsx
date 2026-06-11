import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import Button from '../ui/Button';
import PwaInstallButton from '../PwaInstallButton';
import ThemeToggle from './ThemeToggle';

function getInitials(name) {
  if (!name) {
    return 'FA';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { logout, tenant, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3">
        {onMenuClick ? (
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden" aria-label="Abrir menu">
            <Menu className="h-4 w-4" />
          </Button>
        ) : null}
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Tenant atual</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{tenant?.name || 'Finance AI'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <PwaInstallButton />
        <NotificationBell />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'Usuario autenticado'}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || tenant?.plan || 'Conta ativa'}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {getInitials(user?.name)}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}

export default Topbar;
