import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CircleUser, Eye, EyeOff, LogOut, MessageSquareText, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { cn } from '../../utils/cn';
import NotificationBell from '../notifications/NotificationBell';
import PwaInstallButton from '../PwaInstallButton';
import ThemeToggle from './ThemeToggle';
import FeedbackModal from '../feedback/FeedbackModal';

function getInitials(name) {
  if (!name) {
    return 'FA';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const actionClass = 'flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-surface text-content-secondary shadow-card transition hover:-translate-y-0.5 hover:bg-surface-hover hover:text-content-primary';

function Topbar() {
  const navigate = useNavigate();
  const { logout, tenant, user, isSuperAdmin } = useAuth();
  const { hideValues, toggleHideValues } = usePrivacy();
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/login', { replace: true });
  }

  function handleNavigate(to) {
    setOpen(false);
    navigate(to);
  }

  return (
    <header className="flex h-[60px] items-center justify-end gap-4">
      <div className="flex flex-shrink-0 items-center gap-2">
        <PwaInstallButton compact />
        <ThemeToggle />
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-surface shadow-card">
          <NotificationBell />
        </div>
        <button
          type="button"
          onClick={toggleHideValues}
          className={actionClass}
          aria-label={hideValues ? 'Exibir valores' : 'Ocultar valores'}
          title={hideValues ? 'Exibir valores' : 'Ocultar valores'}
        >
          {hideValues ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className={actionClass}
          aria-label="Configurações"
          title="Configurações"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>

        <div className="relative" ref={containerRef}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              'flex h-12 items-center gap-2 rounded-full border border-border-soft bg-surface p-1.5 pr-3 shadow-card transition hover:-translate-y-0.5 hover:bg-surface-hover',
              open && 'bg-surface-hover'
            )}
            aria-label="Menu do usuário"
            aria-expanded={open}
            aria-haspopup="true"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-white">
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
            <p className="hidden max-w-40 truncate text-sm font-semibold text-content-primary xl:block">
              {user?.name || 'Usuário'}
            </p>
            <ChevronDown className={cn('h-4 w-4 text-content-muted transition', open && 'rotate-180')} />
          </button>

          {open && (
            <div
              className={cn(
                'absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border-ui bg-surface p-2 shadow-floating'
              )}
            >
              <div className="border-b border-border-soft px-3 pb-3 pt-2">
                <p className="truncate text-sm font-semibold text-content-primary">{user?.name || 'Usuário autenticado'}</p>
                <p className="mt-0.5 truncate text-xs text-content-muted">{user?.email || tenant?.name || 'Conta ativa'}</p>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('/profile')}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-content-secondary transition hover:bg-surface-hover hover:text-content-primary"
              >
                <CircleUser className="h-4 w-4" />
                Minha conta
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/settings')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-content-secondary transition hover:bg-surface-hover hover:text-content-primary"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setFeedbackOpen(true); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-content-secondary transition hover:bg-surface-hover hover:text-content-primary"
              >
                <MessageSquareText className="h-4 w-4" />
                Enviar feedback
              </button>
              {isSuperAdmin ? (
                <button
                  type="button"
                  onClick={() => handleNavigate('/admin/dashboard')}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-content-secondary transition hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                >
                  <Shield className="h-4 w-4" />
                  Admin SaaS
                </button>
              ) : null}
              <div className="my-1 border-t border-border-soft" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-content-secondary transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </header>
  );
}

export default Topbar;
