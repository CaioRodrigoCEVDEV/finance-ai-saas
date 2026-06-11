import { Pencil, Trash2, TrendingUp } from 'lucide-react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrencyBRL, formatPercentage, formatDateBR } from '../../utils/formatters';

function getStatusLabel(status) {
  const labels = {
    ACTIVE: 'Ativa',
    COMPLETED: 'Concluida',
    CANCELED: 'Cancelada'
  };

  return labels[status] || status;
}

function getStatusVariant(status) {
  const variants = {
    ACTIVE: 'info',
    COMPLETED: 'success',
    CANCELED: 'neutral'
  };

  return variants[status] || 'neutral';
}

function getProgressColor(progressPercentage) {
  if (progressPercentage >= 100) {
    return 'bg-emerald-500';
  }

  if (progressPercentage >= 60) {
    return 'bg-sky-500';
  }

  if (progressPercentage >= 30) {
    return 'bg-amber-500';
  }

  return 'bg-slate-400';
}

function GoalCard({ goal, onEdit, onDelete, onUpdateProgress, loading }) {
  const progressWidth = `${Math.min(Math.max(goal.progressPercentage, 0), 100)}%`;

  return (
    <Card className="rounded-[30px] border-slate-200/80 bg-white/95 p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Meta financeira</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{goal.name}</h3>
          {goal.description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{goal.description}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(goal.status)}>{getStatusLabel(goal.status)}</Badge>
          <Button variant="ghost" size="sm" onClick={() => onUpdateProgress(goal)} disabled={loading} title="Atualizar progresso">
            <TrendingUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(goal)} disabled={loading} title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(goal)} disabled={loading} title="Excluir">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Valor alvo</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(goal.targetAmount)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Valor atual</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(goal.currentAmount)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Restante</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(goal.remainingAmount)}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>Progresso</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{formatPercentage(goal.progressPercentage)}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700">
          <div className={`h-3 rounded-full ${getProgressColor(goal.progressPercentage)}`} style={{ width: progressWidth }} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Prazo</p>
          <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{goal.deadline ? formatDateBR(goal.deadline) : 'Sem prazo'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Dias restantes</p>
          <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
            {goal.daysRemaining !== null ? `${goal.daysRemaining} dias` : '---'}
          </p>
        </div>
      </div>

      {goal.suggestedMonthlyContribution !== null ? (
        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Contribuicao mensal sugerida</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(goal.suggestedMonthlyContribution)} / mes</p>
        </div>
      ) : null}
    </Card>
  );
}

export default GoalCard;
