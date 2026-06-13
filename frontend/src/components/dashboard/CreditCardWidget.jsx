import { CreditCard } from 'lucide-react';
import Card from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';

function CreditCardWidget({ data }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!data) return null;

  const { totalCards, activeCards, totalLimit, currentInvoiceAmount, availableLimit, usagePercentage } = data;

  return (
    <Card className="rounded-[28px] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          <CreditCard className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Cartões de crédito</h2>
      </div>

      <div className="space-y-3">
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
          <span className="font-semibold text-rose-600">{formatCurrencyPrivacy(currentInvoiceAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Limite disponível</span>
          <span className="font-semibold text-emerald-600">{formatCurrencyPrivacy(availableLimit)}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Uso do limite</span>
          <span>{usagePercentage.toFixed(2)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-2 rounded-full bg-indigo-500"
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

export default CreditCardWidget;
