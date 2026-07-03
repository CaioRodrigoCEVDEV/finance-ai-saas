import Badge from '../ui/Badge';

import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatPercentage } from '../../utils/formatters';

function ExpenseCategoryList({ items }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!items.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma despesa encontrada no período selecionado.</p>;
  }

  return (
    <div className="space-y-4">
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
          ? `${trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•'} ${item.deltaPercentage > 0 ? '+' : item.deltaPercentage < 0 ? '-' : ''}${formatPercentage(Math.abs(item.deltaPercentage))} versus mês anterior`
          : 'Novo no período';

        return (
          <article key={`${item.categoryId || 'uncategorized'}-${item.categoryName}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.categoryName}</h3>
                  <Badge variant="info">{formatPercentage(item.percentage)}</Badge>
                </div>
                <p className={`mt-1 text-xs font-medium ${comparisonTone}`}>{comparisonLabel}</p>
              </div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{formatCurrencyPrivacy(item.amount)}</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${Math.min(Number(item.percentage || 0), 100)}%` }}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default ExpenseCategoryList;
