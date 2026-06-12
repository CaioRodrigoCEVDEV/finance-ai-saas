import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CircleUser, LogOut, Menu, MessageSquareText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
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

function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { logout, tenant, user } = useAuth();
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
    <header className="flex items-center justify-between gap-2 rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Abrir menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Workspace</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{tenant?.name || 'Finance AI'}</p>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <div className="hidden sm:contents">
          <ThemeToggle />
        </div>
        <PwaInstallButton />
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="relative flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
          aria-label="Enviar feedback"
          title="Enviar feedback"
        >
          <MessageSquareText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </button>
        <NotificationBell />

        <div className="relative" ref={containerRef}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              'flex items-center gap-2.5 rounded-2xl p-2 transition',
              'hover:bg-slate-50 dark:hover:bg-slate-700/50',
              open && 'bg-slate-50 dark:bg-slate-700/50'
            )}
            aria-label="Menu do usuário"
            aria-expanded={open}
            aria-haspopup="true"
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'Usuário autenticado'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || tenant?.plan || 'Conta ativa'}</p>
            </div>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 overflow-hidden">
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
            <ChevronDown className={cn('hidden h-4 w-4 text-slate-400 transition sm:block', open && 'rotate-180')} />
          </button>

          {open && (
            <div
              className={cn(
                'absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border p-1.5 shadow-lg',
                'border-slate-200 bg-white',
                'dark:border-slate-600 dark:bg-slate-800'
              )}
            >
              <button
                type="button"
                onClick={() => handleNavigate('/profile')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
              >
                <CircleUser className="h-4 w-4" />
                Minha conta
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/settings')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-600" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
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
