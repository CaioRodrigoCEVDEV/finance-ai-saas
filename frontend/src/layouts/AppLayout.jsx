import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  CalendarDays,
  CheckSquare,
  CircleUser,
  CreditCard,
  Crown,
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
  WalletCards,
  Wand2,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import BottomNavigation from '../components/layout/BottomNavigation';
import MobileTopbar from '../components/layout/MobileTopbar';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const drawerGroups = [
  {
    title: 'Visão Geral',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
      { to: '/recurrences', label: 'Recorrências', icon: Repeat },
      { to: '/financial-tasks', label: 'Tarefas', icon: CheckSquare }
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
  },
  {
    title: 'Configurações',
    items: [
      { to: '/profile', label: 'Perfil', icon: CircleUser },
      { to: '/settings', label: 'Configurações', icon: Settings }
    ]
  }
];

function linkClass(active) {
  return cn(
    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
    active
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
  );
}

const sectionTitleClass =
  'px-3 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500';

function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <AnimatedBackground />
      <div className="mx-auto flex h-full w-full max-w-content gap-5 overflow-hidden px-4 py-5 sm:px-6 lg:gap-6 lg:px-6 xl:px-8">
        <div className="relative z-10 hidden h-full w-72 shrink-0 overflow-hidden lg:block">
          <Sidebar />
        </div>

        <section className="relative z-10 min-w-0 flex-1 overflow-hidden">
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 hidden lg:block">
            <div className="pointer-events-auto">
              <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
            </div>
          </div>

          <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 lg:hidden">
            <div className="pointer-events-auto">
              <MobileTopbar />
            </div>
          </div>

          <main className="scrollbar-none h-full min-w-0 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto min-w-0 max-w-[1400px] space-y-7 pb-24 pt-[88px] lg:pb-10 lg:pt-[112px]">
              {children}
            </div>
          </main>
        </section>
      </div>

      <BottomNavigation onMoreClick={() => setMobileMenuOpen(true)} />

      <div
        className={cn(
          'fixed inset-0 z-40 transition-opacity duration-200 lg:hidden',
          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={cn(
            'absolute inset-0 flex flex-col bg-white transition-transform duration-200 dark:bg-slate-900',
            mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">Finance AI</span>
                <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Personal Finance</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
            {drawerGroups.map((group) => (
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
                        onClick={() => setMobileMenuOpen(false)}
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

          <div className="shrink-0 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
