import { Pencil, Trash2 } from 'lucide-react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrencyBRL, formatPercentage } from '../../utils/formatters';

function getStatusLabel(status) {
  const labels = {
    SAFE: 'Seguro',
    WARNING: 'Atencao',
    EXCEEDED: 'Excedido'
  };

  return labels[status] || status;
}

function getStatusVariant(status) {
  const variants = {
    SAFE: 'success',
    WARNING: 'warning',
    EXCEEDED: 'danger'
  };

  return variants[status] || 'neutral';
}

function getProgressColor(status) {
  const colors = {
    SAFE: 'bg-emerald-500',
    WARNING: 'bg-amber-500',
    EXCEEDED: 'bg-rose-500'
  };

  return colors[status] || 'bg-slate-400';
}

function BudgetCard({ budget, onEdit, onDelete, loading }) {
  const progressWidth = `${Math.min(Math.max(budget.usedPercentage, 0), 100)}%`;

  return (
    <Card className="rounded-[30px] border-slate-200/80 bg-white/95 p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Orcamento mensal</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{budget.name}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{budget.category?.name || 'Categoria nao informada'}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(budget.status)}>{getStatusLabel(budget.status)}</Badge>
          <Button variant="ghost" size="sm" onClick={() => onEdit(budget)} disabled={loading}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(budget)} disabled={loading}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Limite</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(budget.amount)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Utilizado</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(budget.usedAmount)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Restante</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(budget.remainingAmount)}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>Uso do orcamento</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{formatPercentage(budget.usedPercentage)}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700">
          <div className={`h-3 rounded-full ${getProgressColor(budget.status)}`} style={{ width: progressWidth }} />
        </div>
      </div>
    </Card>
  );
}

export default BudgetCard;
