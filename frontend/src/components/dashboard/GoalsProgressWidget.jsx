import { Target } from 'lucide-react';
import Card from '../ui/Card';
import { formatCurrencyBRL } from '../../utils/formatters';

function GoalsProgressWidget({ data }) {
  if (!data) return null;

  const { activeGoals, completedGoals, totalTargetAmount, totalCurrentAmount, overallProgressPercentage } = data;

  return (
    <Card className="rounded-[28px] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Target className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Metas</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Metas ativas</span>
          <span className="font-semibold text-slate-900">{activeGoals}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Concluídas</span>
          <span className="font-semibold text-emerald-600">{completedGoals}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Valor alvo</span>
          <span className="font-semibold text-slate-900">{formatCurrencyBRL(totalTargetAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Valor acumulado</span>
          <span className="font-semibold text-emerald-600">{formatCurrencyBRL(totalCurrentAmount)}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Progresso geral</span>
          <span>{overallProgressPercentage.toFixed(2)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-emerald-500"
            style={{ width: `${Math.min(overallProgressPercentage, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

export default GoalsProgressWidget;
