import { BadgeDollarSign } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/StatusBadge';
import Tooltip from '../ui/Tooltip';
import { usePrivacy } from '../../contexts/PrivacyContext';

function BudgetStatusWidget({ data }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!data) return null;

  const { totalBudget, totalUsed, totalRemaining, usedPercentage, warningCount, exceededCount } = data;

  const hasAlerts = warningCount > 0 || exceededCount > 0;
  const usageStatus = exceededCount > 0 ? 'exceeded' : warningCount > 0 ? 'attention' : 'healthy';
  const statusLabel = exceededCount > 0 ? 'Excedido' : warningCount > 0 ? 'Atenção' : 'Saudável';

  return (
    <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6
      dark:from-slate-800 dark:to-slate-800/80
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:scale-[1.01]
      hover:shadow-glow dark:hover:shadow-glow-dark hover:border-sky-200
      dark:hover:border-sky-800
      group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-900/40 transition-shadow duration-300 group-hover:shadow-md">
            <BadgeDollarSign className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Orçamentos</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Controle de gastos mensais</p>
          </div>
        </div>
        <StatusBadge status={usageStatus} label={statusLabel} />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Orçamento total</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyPrivacy(totalBudget)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Utilizado</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">{formatCurrencyPrivacy(totalUsed)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Disponível</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrencyPrivacy(totalRemaining)}</span>
        </div>
        {hasAlerts && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Alertas</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {warningCount > 0 ? `${warningCount} próximo` : ''}
              {warningCount > 0 && exceededCount > 0 ? ' / ' : ''}
              {exceededCount > 0 ? `${exceededCount} excedido` : ''}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700/50">
        <Tooltip content="Percentual do orçamento utilizado">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Uso geral</span>
            <span className="font-medium">{usedPercentage.toFixed(1)}%</span>
          </div>
        </Tooltip>
        <ProgressBar value={usedPercentage} color={exceededCount > 0 ? 'rose' : warningCount > 0 ? 'amber' : 'sky'} />
      </div>
    </Card>
  );
}

export default BudgetStatusWidget;
