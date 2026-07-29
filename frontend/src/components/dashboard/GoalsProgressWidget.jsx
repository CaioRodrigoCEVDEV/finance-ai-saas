import { Target, Trophy, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/StatusBadge';
import { usePrivacy } from '../../contexts/PrivacyContext';

function GoalsProgressWidget({ data }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!data) return null;

  const { activeGoals, completedGoals, totalTargetAmount, totalCurrentAmount, overallProgressPercentage } = data;

  const progressStatus = overallProgressPercentage >= 75 ? 'excellent' : overallProgressPercentage >= 40 ? 'healthy' : 'attention';
  const statusLabel = overallProgressPercentage >= 75 ? 'Excelente' : overallProgressPercentage >= 40 ? 'Em progresso' : 'Início';

  const barColor = overallProgressPercentage >= 90 ? 'emerald' : overallProgressPercentage >= 60 ? 'sky' : overallProgressPercentage >= 30 ? 'emerald' : 'blue';

  return (
    <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-floating sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-content-primary">Metas</h3>
            <p className="mt-0.5 text-xs text-content-muted">Progresso das suas metas</p>
          </div>
        </div>
        <StatusBadge status={progressStatus} label={statusLabel} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-secondary p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted">Ativas</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-lg font-bold tabular-nums text-content-primary">{activeGoals}</span>
            <TrendingUp className="h-4 w-4 text-success" aria-hidden="true" />
          </div>
        </div>
        <div className="rounded-xl bg-surface-secondary p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted">Concluídas</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-lg font-bold tabular-nums text-success">{completedGoals}</span>
            <Trophy className="h-4 w-4 text-warning" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-surface-secondary p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted">Acumulado</p>
          <span className="text-xs font-semibold tabular-nums text-success">
            {formatCurrencyPrivacy(totalCurrentAmount)} / {formatCurrencyPrivacy(totalTargetAmount)}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-border-soft pt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-content-secondary">
          <span>Progresso geral</span>
          <span className="font-semibold tabular-nums">{overallProgressPercentage.toFixed(1)}%</span>
        </div>
        <ProgressBar value={overallProgressPercentage} color={barColor} height="h-2.5" />
      </div>
    </Card>
  );
}

export default GoalsProgressWidget;
