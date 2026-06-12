import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  CalendarDays,
  CreditCard,
  Crown,
  FileUp,
  FolderKanban,
  Landmark,
  LayoutDashboard,
  LogOut,
  Receipt,
  Repeat,
  Share2,
  Sparkles,
  Target,
  WalletCards,
  Wand2
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

const navigationGroups = [
  {
    title: 'Visão Geral',
    items: [
      { to: '/calendar', label: 'Calendário', icon: CalendarDays },
      { to: '/notifications', label: 'Notificações', icon: Bell }
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { to: '/transactions', label: 'Transações', icon: Receipt },
      { to: '/accounts', label: 'Contas', icon: Landmark },
      { to: '/credit-cards', label: 'Cartões', icon: CreditCard },
      { to: '/invoices', label: 'Faturas', icon: WalletCards },
      { to: '/categories', label: 'Categorias', icon: FolderKanban }
    ]
  },
  {
    title: 'Planejamento',
    items: [
      { to: '/budgets', label: 'Orçamentos', icon: BadgeDollarSign },
      { to: '/goals', label: 'Metas', icon: Target },
      { to: '/recurrences', label: 'Recorrências', icon: Repeat }
    ]
  },
  {
    title: 'Automação',
    items: [
      { to: '/imports', label: 'Importar', icon: FileUp },
      { to: '/categorization-rules', label: 'Regras', icon: Wand2 }
    ]
  },
  {
    title: 'Análises',
    items: [
      { to: '/reports', label: 'Relatórios', icon: BarChart3 }
    ]
  },
  {
    title: 'Conta',
    items: [
      { to: '/invites', label: 'Convites', icon: Share2 },
      { to: '/plans', label: 'Plano / Assinatura', icon: Crown }
    ]
  }
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

  const linkClass = (active) =>
    cn(
      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
      active
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
    );

  const sectionTitleClass =
    'px-3 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500';

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

        <nav className="flex-1 overflow-y-auto p-5 pt-4">
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className={linkClass(location.pathname === '/dashboard')}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {navigationGroups.map((group) => (
            <div key={group.title}>
              <h3 className={sectionTitleClass}>{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onNavigate}
                      className={linkClass(isActive)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
