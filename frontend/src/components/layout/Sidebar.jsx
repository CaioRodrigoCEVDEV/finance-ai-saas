import {
  FolderKanban,
  Landmark,
  LayoutDashboard,
  LogOut,
  Receipt,
  Sparkles
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Contas', icon: Landmark },
  { to: '/transactions', label: 'Transacoes', icon: Receipt },
  { to: '/categories', label: 'Categorias', icon: FolderKanban }
];

function Sidebar({ mobile = false, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
    onNavigate?.();
  }

  return (
    <aside className={cn('flex h-full flex-col', mobile ? 'w-full' : 'sticky top-4')}>
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-tight text-slate-900">Finance AI</span>
            <span className="block text-xs uppercase tracking-[0.24em] text-slate-500">Personal Finance</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
