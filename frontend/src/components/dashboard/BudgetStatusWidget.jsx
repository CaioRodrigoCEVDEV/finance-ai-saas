import { BadgeDollarSign, TrendingDown, AlertTriangle, CircleCheck } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/StatusBadge';
import { usePrivacy } from '../../contexts/PrivacyContext';

function BudgetStatusWidget({ data }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!data) return null;

  const { totalBudget, totalUsed, totalRemaining, usedPercentage, warningCount, exceededCount } = data;

  const hasAlerts = warningCount > 0 || exceededCount > 0;
  const usageStatus = exceededCount > 0 ? 'exceeded' : warningCount > 0 ? 'attention' : 'healthy';
  const statusLabel = exceededCount > 0 ? 'Excedido' : warningCount > 0 ? 'Atenção' : 'Saudável';

  const barColor = exceededCount > 0 ? 'rose' : warningCount > 0 ? 'amber' : 'emerald';

  return (
    <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-info/25 hover:shadow-floating sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-info/10 text-info">
            <BadgeDollarSign className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-content-primary">Orçamentos</h3>
            <p className="mt-0.5 text-xs text-content-muted">Controle de gastos mensais</p>
          </div>
        </div>
        <StatusBadge status={usageStatus} label={statusLabel} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-secondary p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted">Utilizado</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-content-primary">{formatCurrencyPrivacy(totalUsed)}</p>
        </div>
        <div className="rounded-xl bg-surface-secondary p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted">Disponível</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-success">{formatCurrencyPrivacy(totalRemaining)}</p>
        </div>
      </div>

      {hasAlerts && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <span className="text-xs font-medium text-warning">
            {warningCount > 0 && `${warningCount} próximo do limite`}
            {warningCount > 0 && exceededCount > 0 && ' · '}
            {exceededCount > 0 && `${exceededCount} excedido${exceededCount > 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      <div className="mt-4 border-t border-border-soft pt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-content-secondary">
          <span>Uso geral</span>
          <span className="font-semibold tabular-nums">{usedPercentage.toFixed(1)}%</span>
        </div>
        <ProgressBar value={usedPercentage} color={barColor} height="h-2.5" />
      </div>
    </Card>
  );
}

export default BudgetStatusWidget;
