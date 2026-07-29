import { Eye, EyeOff, Menu } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
import NotificationBell from '../notifications/NotificationBell';
import ThemeToggle from './ThemeToggle';

function getInitials(name) {
  if (!name) return 'FA';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function MobileTopbar({ onMenuClick }) {
  const { user } = useAuth();
  const { hideValues, toggleHideValues } = usePrivacy();

  return (
    <header className="flex h-14 items-center justify-between rounded-[22px] border border-border-soft bg-surface/90 px-2.5 shadow-card backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-content-secondary transition hover:bg-surface-hover hover:text-content-primary"
            aria-label="Abrir menu administrativo"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
        </div>
        <p className="hidden truncate text-sm font-bold tracking-[-0.02em] text-content-primary min-[390px]:block">
          FinanceAI
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={toggleHideValues}
          className="flex h-10 w-10 items-center justify-center rounded-full text-content-secondary transition hover:bg-surface-hover hover:text-content-primary"
          aria-label={hideValues ? 'Exibir valores' : 'Ocultar valores'}
          title={hideValues ? 'Exibir valores' : 'Ocultar valores'}
        >
          {hideValues ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
        <ThemeToggle />
        <NotificationBell />
        <div className="ml-0.5 hidden h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-white min-[430px]:flex">
          {user?.avatar_url ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${user.avatar_url}`}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(user?.name)
          )}
        </div>
      </div>
    </header>
  );
}

export default MobileTopbar;
