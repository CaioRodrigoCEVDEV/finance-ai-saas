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
  MessageSquareText,
  Receipt,
  Repeat,
  Settings,
  Share2,
  Shield,
  Target,
  WalletCards,
  Wand2
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import FeedbackModal from '../feedback/FeedbackModal';

const navigationGroups = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
      { to: '/accounts', label: 'Contas', icon: Landmark },
      { to: '/credit-cards', label: 'Cartões', icon: CreditCard },
      { to: '/invoices', label: 'Faturas', icon: WalletCards },
      { to: '/transactions', label: 'Transações', icon: Receipt },
      { to: '/calendar', label: 'Calendário', icon: CalendarDays },
      { to: '/budgets', label: 'Orçamentos', icon: BadgeDollarSign },
      { to: '/goals', label: 'Metas', icon: Target },
      { to: '/recurrences', label: 'Recorrências', icon: Repeat },
      { to: '/financial-tasks', label: 'Tarefas financeiras', icon: CheckSquare },
      { to: '/notifications', label: 'Notificações', icon: Bell }
    ]
  },
  {
    title: 'Ferramentas',
    items: [
      { to: '/imports', label: 'Importação', icon: FileUp },
      { to: '/reports', label: 'Relatórios', icon: BarChart3 },
      { to: '/categorization-rules', label: 'Regras', icon: Wand2 }
    ]
  },
  {
    title: 'Preferências',
    separated: true,
    items: [
      { to: '/settings', label: 'Configurações', icon: Settings },
      { to: '/categories', label: 'Categorias', icon: FolderKanban },
      { to: '/profile', label: 'Minha conta', icon: CircleUser },
      { to: '/invites', label: 'Convites', icon: Share2 },
      { to: '/plans', label: 'Plano / Assinatura', icon: Crown }
    ]
  }
];

function Sidebar({ mobile = false, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSuperAdmin, logout, tenant } = useAuth();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const plan = tenant?.plan || 'FREE';
  const hasPaidPlan = plan !== 'FREE';
  const canManagePlan = tenant?.role === 'OWNER';

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
    onNavigate?.();
  }

  const linkClass = (active) =>
    cn(
      'group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-white/80 transition',
      active
        ? 'bg-white/[0.16] text-white ring-1 ring-inset ring-white/10'
        : 'hover:bg-white/10 hover:text-white'
    );

  const sectionTitleClass =
    'px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50';

  return (
    <aside
      className={cn(
        'flex flex-col overflow-hidden',
        mobile ? 'h-full w-full max-h-full' : 'h-full w-full'
      )}
    >
      <div
        className={cn(
          'flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-emerald-700 via-emerald-700 to-emerald-800 text-white',
          mobile ? 'rounded-none border-0 shadow-none' : 'rounded-[26px] border border-white/10 shadow-floating'
        )}
      >
        <div className={cn(
          'shrink-0 px-5 pb-3',
          mobile ? 'pr-14 pt-[calc(1.25rem+env(safe-area-inset-top))]' : 'pt-5'
        )}>
          <Link to="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              <img src="/favicon.svg" alt="" className="h-9 w-9" />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-[-0.03em] text-white">FinanceAI</span>
              <span className="block text-[9px] font-medium uppercase tracking-[0.2em] text-emerald-100/70">Finanças inteligentes</span>
            </span>
          </Link>
        </div>

        <nav className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
          {navigationGroups.map((group) => (
            <div key={group.title} className={group.separated ? 'mt-2 border-t border-white/20 pt-1' : undefined}>
              <h3 className={sectionTitleClass}>{group.title}</h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                        onClick={onNavigate}
                        className={linkClass(isActive)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="h-[17px] w-[17px] shrink-0 text-white/75 transition group-hover:text-white" />
                        {item.label}
                      </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {isSuperAdmin ? (
            <Link
              to="/admin/dashboard"
              onClick={onNavigate}
              className={linkClass(location.pathname.startsWith('/admin'))}
            >
              <Shield className="h-[17px] w-[17px] shrink-0" />
              Administração SaaS
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className={cn(linkClass(false), 'w-full')}
          >
            <MessageSquareText className="h-[17px] w-[17px] shrink-0" />
            Enviar feedback
          </button>
        </nav>

        <div className="shrink-0 px-3 pb-2">
          <div className="rounded-2xl border border-white/15 bg-white/[0.12] p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-700">
                <Crown className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {hasPaidPlan ? `FinanceAI ${plan}` : 'Conheça o Premium'}
                </p>
                <p className="mt-0.5 text-[10px] text-emerald-50/70">
                  {hasPaidPlan ? 'Seu plano está ativo.' : 'Mais recursos para suas finanças.'}
                </p>
              </div>
            </div>
            <Link
              to="/plans"
              onClick={onNavigate}
              className="mt-3 flex h-9 items-center justify-center rounded-xl bg-white px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              {canManagePlan && hasPaidPlan ? 'Gerenciar plano' : 'Ver detalhes'}
            </Link>
          </div>
        </div>

        <div className={cn(
          'shrink-0 border-t border-white/15 px-3 pt-2.5',
          mobile ? 'pb-[calc(0.625rem+env(safe-area-inset-bottom))]' : 'pb-2.5'
        )}>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-[17px] w-[17px]" />
            Sair
          </button>
        </div>
      </div>
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </aside>
  );
}

export default Sidebar;
