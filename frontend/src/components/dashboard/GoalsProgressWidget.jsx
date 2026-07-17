import { Target } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/StatusBadge';
import Tooltip from '../ui/Tooltip';
import { usePrivacy } from '../../contexts/PrivacyContext';

function GoalsProgressWidget({ data }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!data) return null;

  const { activeGoals, completedGoals, totalTargetAmount, totalCurrentAmount, overallProgressPercentage } = data;

  const progressStatus = overallProgressPercentage >= 75 ? 'excellent' : overallProgressPercentage >= 40 ? 'healthy' : 'attention';
  const statusLabel = overallProgressPercentage >= 75 ? 'Excelente' : overallProgressPercentage >= 40 ? 'Em progresso' : 'Início';

  return (
    <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6
      dark:from-slate-800 dark:to-slate-800/80
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:scale-[1.01]
      hover:shadow-glow dark:hover:shadow-glow-dark hover:border-emerald-200
      dark:hover:border-emerald-800
      group">
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

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Metas ativas</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{activeGoals}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Concluídas</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completedGoals}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Valor alvo</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyPrivacy(totalTargetAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Valor acumulado</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrencyPrivacy(totalCurrentAmount)}</span>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700/50">
        <Tooltip content="Progresso geral de todas as metas">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Progresso geral</span>
            <span className="font-medium">{overallProgressPercentage.toFixed(1)}%</span>
          </div>
        </Tooltip>
        <ProgressBar value={overallProgressPercentage} color="emerald" />
      </div>
    </Card>
  );
}

export default GoalsProgressWidget;
