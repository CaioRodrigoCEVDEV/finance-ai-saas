import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Crown,
  MessageSquareText,
  Settings2,
  ScrollText,
  Shield,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

const adminNavigation = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/tenants', label: 'Workspaces', icon: Building2 },
  { to: '/admin/users', label: 'Usuários', icon: Users },
  { to: '/admin/plans', label: 'Planos e Limites', icon: Crown },
  { to: '/admin/payment-settings', label: 'Pagamentos', icon: Settings2 },
  { to: '/admin/feedbacks', label: 'Feedbacks', icon: MessageSquareText },
  { to: '/admin/audit-logs', label: 'Auditoria', icon: ScrollText }
];

function AdminSidebar({ mobile = false, onNavigate }) {
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
        ? 'bg-white/[0.16] text-white ring-1 ring-inset ring-white/10'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    );

  return (
    <aside
      className={cn(
        'flex h-full max-h-full flex-col overflow-hidden',
        mobile ? 'w-full' : 'w-full'
      )}
    >
      <div
        className={cn(
          'flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-emerald-800 via-emerald-800 to-emerald-900 text-white',
          mobile ? 'rounded-none border-0 shadow-none' : 'rounded-[26px] border border-white/10 shadow-floating'
        )}
      >
        <div className={cn(
          'shrink-0 border-b border-white/15 px-5 pb-5',
          mobile ? 'pr-14 pt-[calc(1.25rem+env(safe-area-inset-top))]' : 'pt-5'
        )}>
          <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-800">
              <Shield className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-[-0.03em] text-white">Admin SaaS</span>
              <span className="block text-[9px] font-medium uppercase tracking-[0.2em] text-emerald-100/70">FinanceAI</span>
            </span>
          </Link>
        </div>

        <nav className="scrollbar-none flex-1 overflow-y-auto overscroll-contain p-3 pt-4">
          <div className="space-y-1">
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={linkClass(isActive)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={cn(
          'shrink-0 border-t border-white/15 px-3 pt-3',
          mobile ? 'pb-[calc(0.75rem+env(safe-area-inset-bottom))]' : 'pb-3'
        )}>
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao App
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
