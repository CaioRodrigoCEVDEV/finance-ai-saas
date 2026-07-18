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
    <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-5
      dark:from-slate-800 dark:to-slate-800/80
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:scale-[1.01]
      hover:shadow-glow dark:hover:shadow-glow-dark hover:border-emerald-200
      dark:hover:border-emerald-800
      group sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 transition-shadow duration-300 group-hover:shadow-md">
            <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Metas</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Progresso das suas metas</p>
          </div>
        </div>
        <StatusBadge status={progressStatus} label={statusLabel} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50/80 p-3 dark:bg-slate-700/20">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Ativas</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">{activeGoals}</span>
            <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
          </div>
        </div>
        <div className="rounded-xl bg-slate-50/80 p-3 dark:bg-slate-700/20">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Concluídas</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{completedGoals}</span>
            <Trophy className="h-4 w-4 text-amber-500 dark:text-amber-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-700/20">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Acumulado</p>
          <span className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCurrencyPrivacy(totalCurrentAmount)} / {formatCurrencyPrivacy(totalTargetAmount)}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700/50">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Progresso geral</span>
          <span className="font-semibold tabular-nums">{overallProgressPercentage.toFixed(1)}%</span>
        </div>
        <ProgressBar value={overallProgressPercentage} color={barColor} height="h-2.5" />
      </div>
    </Card>
  );
}

export default GoalsProgressWidget;
