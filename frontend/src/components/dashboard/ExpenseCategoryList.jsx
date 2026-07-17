import { Layers3 } from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatPercentage } from '../../utils/formatters';

function ExpenseCategoryList({ items }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
          <Layers3 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhuma despesa encontrada</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">no período selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const trend = item.trend || (item.deltaPercentage > 0 ? 'up' : item.deltaPercentage < 0 ? 'down' : 'flat');
        const hasPrevious = Number(item.previousAmount || 0) > 0;
        const comparisonTone = hasPrevious
          ? (trend === 'up'
            ? 'text-rose-600 dark:text-rose-400'
            : trend === 'down'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400')
          : 'text-slate-500 dark:text-slate-400';
        const comparisonLabel = hasPrevious
          ? `${trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} ${item.deltaPercentage > 0 ? '+' : item.deltaPercentage < 0 ? '-' : ''}${formatPercentage(Math.abs(item.deltaPercentage))} vs mês anterior`
          : 'Novo no período';

        return (
          <article key={`${item.categoryId || 'uncategorized'}-${item.categoryName}`} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.categoryName}</h3>
                  <Badge variant="info">{formatPercentage(item.percentage)}</Badge>
                </div>
                <p className={`mt-1 text-xs font-medium ${comparisonTone}`}>{comparisonLabel}</p>
              </div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{formatCurrencyPrivacy(item.amount)}</p>
            </div>
            <div className="mt-3">
              <ProgressBar value={Number(item.percentage || 0)} color="emerald" height="h-1.5" />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default ExpenseCategoryList;
