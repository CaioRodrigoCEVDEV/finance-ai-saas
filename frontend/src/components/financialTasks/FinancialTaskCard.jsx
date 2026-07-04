import { Check, Pencil, Trash2, AlertCircle, DollarSign, Bell } from 'lucide-react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatDateBR } from '../../utils/formatters';

const priorityConfig = {
  LOW: { label: 'Baixa', variant: 'success', icon: null },
  MEDIUM: { label: 'Media', variant: 'warning', icon: null },
  HIGH: { label: 'Alta', variant: 'danger', icon: null },
  URGENT: { label: 'Urgente', variant: 'danger', icon: AlertCircle }
};

const statusConfig = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  IN_PROGRESS: { label: 'Em andamento', variant: 'info' },
  COMPLETED: { label: 'Concluida', variant: 'success' },
  CANCELLED: { label: 'Cancelada', variant: 'neutral' }
};

function getDaysUntilDue(dueDate) {
  if (!dueDate) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function FinancialTaskCard({ task, onComplete, onEdit, onDelete, onGenerateTransaction, loading }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const status = statusConfig[task.status] || statusConfig.PENDING;
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== 'COMPLETED';
  const hasReminder = task.reminderAt && !task.notificationSent;

  return (
    <Card className="rounded-[30px] border-slate-200/80 bg-white/95 p-6 w-full max-w-full min-w-0 overflow-hidden dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
              {status.label}
            </p>
            <Badge variant={priority.variant}>{priority.label}</Badge>
            {hasReminder ? (
              <Badge variant="info">
                <Bell className="mr-1 h-3 w-3 inline" />
                Lembrete
              </Badge>
            ) : null}
            {isOverdue ? (
              <Badge variant="danger">
                <AlertCircle className="mr-1 h-3 w-3 inline" />
                Atrasada
              </Badge>
            ) : null}
            {task.generatedTransactionId ? (
              <Badge variant="success">Transacao gerada</Badge>
            ) : null}
          </div>

          <div className="mt-2 flex items-start gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 break-words whitespace-normal leading-tight min-w-0 max-w-full">
              {task.title}
            </h3>
          </div>

          {task.description ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 break-words whitespace-pre-wrap line-clamp-2">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' ? (
            <Button variant="ghost" size="sm" onClick={() => onComplete(task)} disabled={loading} title="Concluir">
              <Check className="h-4 w-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)} disabled={loading} title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          {task.status === 'COMPLETED' && !task.generatedTransactionId ? (
            <Button variant="ghost" size="sm" onClick={() => onGenerateTransaction(task)} disabled={loading} title="Gerar transacao">
              <DollarSign className="h-4 w-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => onDelete(task)} disabled={loading} title="Excluir">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        {task.estimatedAmount ? (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Valor previsto</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrencyPrivacy(task.estimatedAmount)}
            </p>
          </div>
        ) : null}

        {task.accountName ? (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Conta</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{task.accountName}</p>
          </div>
        ) : null}

        {task.dueDate ? (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Vencimento</p>
            <p className={`mt-1 text-sm font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {formatDateBR(task.dueDate)}
              {daysUntilDue !== null ? (
                <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                  {isOverdue ? `(${Math.abs(daysUntilDue)}d atrasado)` : daysUntilDue === 0 ? '(hoje)' : `(${daysUntilDue}d)`}
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        {task.totalItems > 0 ? (
          <div className="w-full border-t border-slate-100 pt-3 dark:border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{task.completedItems}/{task.totalItems} itens</span>
              <span>{task.progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
          </div>
        ) : null}

        {task.reminderAt ? (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Lembrete</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {formatDateBR(task.reminderAt)}
            </p>
          </div>
        ) : null}

        {task.completedAt ? (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Concluida em</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {formatDateBR(task.completedAt)}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export default FinancialTaskCard;
