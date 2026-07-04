import { CreditCard, LayoutDashboard, Menu, Plus, Receipt } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { cn } from '../../utils/cn';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações', icon: Receipt },
  null,
  { to: '/credit-cards', label: 'Cartões', icon: CreditCard },
  { to: null, label: 'Mais', icon: Menu, isMore: true },
];

function BottomNavigation({ onMoreClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(to) {
    if (!to) return false;
    return location.pathname === to;
  }

  function handleClick(item) {
    if (item.isMore) {
      onMoreClick?.();
    } else if (item.to) {
      navigate(item.to);
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-[64px] items-stretch border-t border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-800/85">
        {items.slice(0, 2).map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center text-[10px] font-medium transition-colors',
              isActive(item.to)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="mt-0.5 h-3 leading-3">
              {isActive(item.to) ? item.label : ''}
            </span>
          </button>
        ))}

        <div className="relative flex-1">
          <button
            onClick={() => navigate('/transactions', { state: { openNewTransaction: true } })}
            className="absolute left-1/2 -top-3 -translate-x-1/2 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-95 dark:bg-emerald-500 dark:shadow-emerald-500/25 dark:hover:bg-emerald-400"
            aria-label="Nova transação"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {items.slice(3).map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center text-[10px] font-medium transition-colors',
              isActive(item.to)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="mt-0.5 h-3 leading-3">
              {isActive(item.to) ? item.label : ''}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation;
