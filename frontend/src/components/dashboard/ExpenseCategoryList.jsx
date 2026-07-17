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
    <div className="space-y-2.5">
      {items.map((item) => {
        const trend = item.trend || (item.deltaPercentage > 0 ? 'up' : item.deltaPercentage < 0 ? 'down' : 'flat');
        const hasPrevious = Number(item.previousAmount || 0) > 0;

        const trendConfig = {
          up: {
            arrow: '↑',
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
            barColor: 'rose',
            label: 'Aumento'
          },
          down: {
            arrow: '↓',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            barColor: 'emerald',
            label: 'Redução'
          },
          flat: {
            arrow: '→',
            color: 'text-slate-500 dark:text-slate-400',
            bg: 'bg-slate-100 dark:bg-slate-700/30',
            barColor: 'sky',
            label: 'Estável'
          }
        };

        const current = trendConfig[trend] || trendConfig.flat;
        const absDelta = Math.abs(item.deltaPercentage || 0);

        return (
          <article
            key={`${item.categoryId || 'uncategorized'}-${item.categoryName}`}
            className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:border-slate-200 hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:border-slate-600/50 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.categoryName}</h3>
                  <Badge variant="info" className="shrink-0">{formatPercentage(item.percentage)}</Badge>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  {hasPrevious ? (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${current.bg} ${current.color}`}>
                      <span aria-hidden="true">{current.arrow}</span>
                      {absDelta > 0 ? `${absDelta.toFixed(1)}%` : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700/30 dark:text-slate-400">
                      Novo
                    </span>
                  )}
                  {hasPrevious && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">vs mês anterior</span>
                  )}
                </div>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                {formatCurrencyPrivacy(item.amount)}
              </p>
            </div>
            <div className="mt-3">
              <ProgressBar value={Number(item.percentage || 0)} color={current.barColor} height="h-1.5" />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default ExpenseCategoryList;
