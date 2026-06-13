import { Bell, CheckCheck, TrendingDown, Target, CreditCard, Tag, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getNotifications, getUnreadCount, markAllAsRead } from '../../services/notificationService';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays < 7) return `Há ${diffDays}d`;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

const typeConfig = {
  BUDGET_WARNING: {
    icon: TrendingDown,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30'
  },
  BUDGET_EXCEEDED: {
    icon: AlertTriangle,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/30'
  },
  UNCATEGORIZED_TRANSACTIONS: {
    icon: Tag,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-900/30'
  },
  GOAL_COMPLETED: {
    icon: Target,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30'
  },
  CREDIT_CARD_LIMIT: {
    icon: CreditCard,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/30'
  }
};

function NotificationItem({ notification, onClose }) {
  const navigate = useNavigate();
  const config = typeConfig[notification.type] || typeConfig.UNCATEGORIZED_TRANSACTIONS;
  const Icon = config.icon;

  function handleClick() {
    navigate('/notifications');
    onClose?.();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/50',
        !notification.isRead && 'bg-slate-50 dark:bg-slate-700/30'
      )}
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', config.bg)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {!notification.isRead && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          )}
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {notification.title}
          </p>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {formatRelativeDate(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}

function NotificationBell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
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
      loadRecentNotifications();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  async function loadUnreadCount() {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count);
    } catch {
      // silent
    }
  }

  async function loadRecentNotifications() {
    setLoading(true);
    try {
      const data = await getNotifications({ limit: 5 });
      setNotifications(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  }

  function handleToggle() {
    setOpen((prev) => !prev);
  }

  return (
    <div className="relative">
      <button
        ref={bellRef}
        type="button"
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-2xl text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:h-10 sm:w-10 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
        aria-label="Notificações"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white ring-2 ring-white dark:ring-slate-800">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="fixed left-4 right-4 top-24 z-[60] max-w-[calc(100vw-2rem)] origin-top rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-black/40 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 sm:origin-top-right"
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4" />
                Ler tudo
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto px-2 pb-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Nenhuma notificação
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} onClose={() => setOpen(false)} />
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
