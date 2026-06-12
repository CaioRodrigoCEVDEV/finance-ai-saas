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
  Sparkles
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
        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
    );

  return (
    <aside className={cn('flex flex-col', mobile ? 'h-full w-full' : 'sticky top-4')}>
      <div
        className={cn(
          'flex flex-col rounded-[28px] border border-amber-200 bg-white shadow-soft dark:border-amber-800 dark:bg-slate-800',
          mobile && 'h-full'
        )}
      >
        <div className="shrink-0 border-b border-amber-100 p-5 dark:border-amber-800">
          <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-600 text-white">
              <Shield className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Admin SaaS</span>
              <span className="block text-xs font-medium uppercase tracking-[0.24em] text-amber-600 dark:text-amber-400">Finance AI</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-5">
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
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-amber-100 p-5 dark:border-amber-800">
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao App
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
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
