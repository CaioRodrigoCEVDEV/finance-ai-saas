import { CreditCard } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/StatusBadge';
import Tooltip from '../ui/Tooltip';
import { usePrivacy } from '../../contexts/PrivacyContext';

function CreditCardWidget({ data }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!data) return null;

  const { totalCards, activeCards, totalLimit, currentInvoiceAmount, availableLimit, usagePercentage } = data;

  const usageStatus = usagePercentage > 80 ? 'critical' : usagePercentage > 60 ? 'warning' : 'healthy';
  const statusLabel = usagePercentage > 80 ? 'Crítico' : usagePercentage > 60 ? 'Atenção' : 'Saudável';

  return (
    <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6
      dark:from-slate-800 dark:to-slate-800/80
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:scale-[1.01]
      hover:shadow-glow dark:hover:shadow-glow-dark hover:border-indigo-200
      dark:hover:border-indigo-800
      group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 transition-shadow duration-300 group-hover:shadow-md">
            <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Cartões de crédito</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Resumo dos cartões cadastrados</p>
          </div>
        </div>
        <StatusBadge status={usageStatus} label={statusLabel} />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Cartões ativos</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{activeCards} de {totalCards}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Limite total</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyPrivacy(totalLimit)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Fatura atual</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">{formatCurrencyPrivacy(currentInvoiceAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Limite disponível</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrencyPrivacy(availableLimit)}</span>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700/50">
        <Tooltip content="Uso do limite disponível">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Uso do limite</span>
            <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
          </div>
        </Tooltip>
        <ProgressBar value={usagePercentage} color="indigo" />
      </div>
    </Card>
  );
}

export default CreditCardWidget;
