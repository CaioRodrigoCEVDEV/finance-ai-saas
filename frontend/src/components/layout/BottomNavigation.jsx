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

function BottomNavigation({ onMoreClick, onQuickAdd, canQuickAdd = true }) {
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
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border-soft bg-surface/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Navegação principal"
    >
      <div className="flex h-[64px] items-stretch">
        {items.slice(0, 2).map((item) => (
          <button
            type="button"
            key={item.label}
            onClick={() => handleClick(item)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center text-[10px] font-medium transition-colors',
              isActive(item.to)
                ? 'text-primary'
                : 'text-content-muted hover:text-content-primary'
            )}
            aria-current={isActive(item.to) ? 'page' : undefined}
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5" />
            <span className="mt-1 leading-none">{item.label}</span>
          </button>
        ))}

        <div className="relative flex-1">
          <button
            type="button"
            onClick={onQuickAdd}
            disabled={!canQuickAdd}
            className="absolute left-1/2 -top-3 flex h-[52px] w-[52px] -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white shadow-floating transition hover:-translate-x-1/2 hover:-translate-y-0.5 hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:bg-content-muted disabled:opacity-70 disabled:hover:-translate-y-0"
            aria-label="Adicionar lançamento"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {items.slice(3).map((item) => (
          <button
            type="button"
            key={item.label}
            onClick={() => handleClick(item)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center text-[10px] font-medium transition-colors',
              isActive(item.to)
                ? 'text-primary'
                : 'text-content-muted hover:text-content-primary'
            )}
            aria-current={isActive(item.to) ? 'page' : undefined}
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5" />
            <span className="mt-1 leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation;
