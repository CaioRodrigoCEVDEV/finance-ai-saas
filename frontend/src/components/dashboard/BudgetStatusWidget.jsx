import { BadgeDollarSign } from 'lucide-react';
import Card from '../ui/Card';
import { formatCurrencyBRL } from '../../utils/formatters';

function BudgetStatusWidget({ data }) {
  if (!data) return null;

  const { totalBudget, totalUsed, totalRemaining, usedPercentage, warningCount, exceededCount } = data;

  return (
    <Card className="rounded-[28px] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
          <BadgeDollarSign className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Orçamentos</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Orçamento total</span>
          <span className="font-semibold text-slate-900">{formatCurrencyBRL(totalBudget)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Utilizado</span>
          <span className="font-semibold text-rose-600">{formatCurrencyBRL(totalUsed)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Disponível</span>
          <span className="font-semibold text-emerald-600">{formatCurrencyBRL(totalRemaining)}</span>
        </div>
        {(warningCount > 0 || exceededCount > 0) && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Alertas</span>
            <span className="font-semibold text-amber-600">
              {warningCount > 0 ? `${warningCount} próximo do limite` : ''}
              {warningCount > 0 && exceededCount > 0 ? ' / ' : ''}
              {exceededCount > 0 ? `${exceededCount} excedido` : ''}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Uso geral</span>
          <span>{usedPercentage.toFixed(2)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-sky-500"
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

export default BudgetStatusWidget;
