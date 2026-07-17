import { Check, RotateCcw, Pencil, Trash2, AlertCircle } from 'lucide-react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatDateBR } from '../../utils/formatters';

const priorityConfig = {
  LOW: { label: 'Baixa', variant: 'success', icon: null },
  MEDIUM: { label: 'Media', variant: 'warning', icon: null },
  HIGH: { label: 'Alta', variant: 'danger', icon: null },
  URGENT: { label: 'Urgente', variant: 'danger', icon: AlertCircle }
};

const statusConfig = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  COMPLETED: { label: 'Concluida', variant: 'success' }
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

function FinancialTaskCard({ task, onToggleStatus, onEdit, onDelete, loading }) {
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const status = statusConfig[task.status] || statusConfig.PENDING;
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && task.status !== 'COMPLETED';
  const isCompleted = task.status === 'COMPLETED';

  return (
    <Card className="rounded-[30px] border-slate-200/80 bg-white/95 p-6 w-full max-w-full min-w-0 overflow-hidden dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
              {status.label}
            </p>
            <Badge variant={priority.variant}>{priority.label}</Badge>
            {isOverdue ? (
              <Badge variant="danger">
                <AlertCircle className="mr-1 h-3 w-3 inline" />
                Atrasada
              </Badge>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(task)}
            disabled={loading}
            title={isCompleted ? 'Marcar como pendente' : 'Concluir tarefa'}
          >
            {isCompleted ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)} disabled={loading} title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(task)} disabled={loading} title="Excluir">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
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

        {task.completedAt ? (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Concluida em</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {formatDateBR(task.completedAt)}
            </p>
          </div>
        ) : null}

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Atualizada em</p>
          <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
            {formatDateBR(task.updatedAt)}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default FinancialTaskCard;
