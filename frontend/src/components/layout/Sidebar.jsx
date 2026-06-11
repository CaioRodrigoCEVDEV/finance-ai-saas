import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  CalendarDays,
  CircleUser,
  CreditCard,
  FileUp,
  FolderKanban,
  Landmark,
  LayoutDashboard,
  LogOut,
  Receipt,
  Repeat,
  Settings,
  Share2,
  Sparkles,
  Target,
  Wand2
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Contas', icon: Landmark },
  { to: '/credit-cards', label: 'Cartões', icon: CreditCard },
  { to: '/budgets', label: 'Orçamentos', icon: BadgeDollarSign },
  { to: '/goals', label: 'Metas', icon: Target },
  { to: '/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/recurrences', label: 'Recorrencias', icon: Repeat },
  { to: '/transactions', label: 'Transações', icon: Receipt },
  { to: '/categories', label: 'Categorias', icon: FolderKanban },
  { to: '/categorization-rules', label: 'Regras', icon: Wand2 },
  { to: '/notifications', label: 'Notificacoes', icon: Bell },
  { to: '/reports', label: 'Relatórios', icon: BarChart3 },
  { to: '/imports', label: 'Importar', icon: FileUp },
  { to: '/invites', label: 'Convites', icon: Share2 },
  { to: '/profile', label: 'Minha conta', icon: CircleUser },
  { to: '/settings', label: 'Configurações', icon: Settings }
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
    <aside className={cn('flex flex-col', mobile ? 'h-full w-full' : 'sticky top-4')}>
      <div
        className={cn(
          'flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800',
          mobile && 'h-full'
        )}
      >
        <div className="shrink-0 p-5 pb-0">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Finance AI</span>
              <span className="block text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Personal Finance</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-5 pt-4 space-y-2">
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
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-5 dark:border-slate-700">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
