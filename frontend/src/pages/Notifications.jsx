import {
  AlertTriangle,
  Bell,
  Check,
  CreditCard,
  Tag,
  Target,
  TrendingDown,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';

import AppLayout from '../layouts/AppLayout';
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead
} from '../services/notificationService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';

const typeConfig = {
  BUDGET_WARNING: {
    icon: TrendingDown,
    label: 'Orcamento',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    badge: 'warning'
  },
  BUDGET_EXCEEDED: {
    icon: AlertTriangle,
    label: 'Orcamento excedido',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    badge: 'danger'
  },
  UNCATEGORIZED_TRANSACTIONS: {
    icon: Tag,
    label: 'Categorizacao',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-900/30',
    badge: 'info'
  },
  GOAL_COMPLETED: {
    icon: Target,
    label: 'Meta',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    badge: 'success'
  },
  CREDIT_CARD_LIMIT: {
    icon: CreditCard,
    label: 'Cartao',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    badge: 'neutral'
  }
};

function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `Ha ${diffMin} min`;
  if (diffHours < 24) return `Ha ${diffHours}h`;
  if (diffDays < 7) return `Ha ${diffDays}d`;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

function NotificationCard({ notification, onRead, onDelete }) {
  const config = typeConfig[notification.type] || typeConfig.UNCATEGORIZED_TRANSACTIONS;
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'flex gap-4 p-5 transition',
        !notification.isRead && 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-900/10'
      )}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', config.bg)}>
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {!notification.isRead && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          )}
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {notification.title}
          </h3>
          <Badge variant={config.badge}>{config.label}</Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {notification.message}
        </p>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {formatRelativeDate(notification.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-start gap-1">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRead(notification.id)}
            aria-label="Marcar como lida"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(notification.id)}
          aria-label="Excluir notificacao"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

const FILTER_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'false', label: 'Nao lidas' },
  { value: 'true', label: 'Lidas' },
  { value: 'BUDGET_WARNING', label: 'Orcamento' },
  { value: 'BUDGET_EXCEEDED', label: 'Excedido' },
  { value: 'UNCATEGORIZED_TRANSACTIONS', label: 'Sem categoria' },
  { value: 'GOAL_COMPLETED', label: 'Metas' },
  { value: 'CREDIT_CARD_LIMIT', label: 'Cartoes' }
];

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page, filter]);

  async function loadNotifications() {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter === 'false') {
        params.isRead = false;
      } else if (filter === 'true') {
        params.isRead = true;
      } else if (filter && !['false', 'true'].includes(filter)) {
        params.type = filter;
      }

      const data = await getNotifications(params);
      setNotifications(data.data);
      setPagination(data.pagination);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // silent
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silent
    }
  }

  function handlePageChange(newPage) {
    setPage(newPage);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppLayout>
      <PageHeader
        title="Notificacoes"
        description="Acompanhe seus alertas e notificacoes financeiras"
        action={
          unreadCount > 0 ? (
            <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
              <Check className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          ) : null
        }
      />

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setFilter(option.value);
                setPage(1);
              }}
              className={cn(
                'rounded-2xl px-4 py-2 text-sm font-medium transition',
                filter === option.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading && notifications.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="flex gap-4 p-5">
                <LoadingSkeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <LoadingSkeleton className="h-4 w-2/3" />
                  <LoadingSkeleton className="h-3 w-full" />
                  <LoadingSkeleton className="h-3 w-4/5" />
                </div>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nenhuma notificacao"
            description="Voce nao possui notificacoes no momento. Os alertas financeiros serao gerados automaticamente conforme seus dados."
          />
        ) : (
          <>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Pagina {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Proximo
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default Notifications;
