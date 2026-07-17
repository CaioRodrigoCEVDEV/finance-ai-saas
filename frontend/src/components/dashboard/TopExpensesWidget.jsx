import { ArrowDownRight } from 'lucide-react';
import Card from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatDateBR } from '../../utils/formatters';

function TopExpensesWidget({ expenses }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!expenses || expenses.length === 0) {
    return (
      <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6
        dark:from-slate-800 dark:to-slate-800/80
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.01]
        hover:shadow-glow dark:hover:shadow-glow-dark hover:border-rose-200
        dark:hover:border-rose-800
        group">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-900/40">
            <ArrowDownRight className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">Nenhuma despesa encontrada</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">no período selecionado</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6
      dark:from-slate-800 dark:to-slate-800/80
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:scale-[1.01]
      hover:shadow-glow dark:hover:shadow-glow-dark hover:border-rose-200
      dark:hover:border-rose-800
      group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-900/40 transition-shadow duration-300 group-hover:shadow-md">
            <ArrowDownRight className="h-5 w-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Top 5 despesas</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Maiores gastos do período</p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {expenses.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.description}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.categoryName} • {formatDateBR(item.transactionDate)}
              </p>
            </div>
            <p className="ml-3 shrink-0 text-sm font-semibold text-rose-600 dark:text-rose-400">{formatCurrencyPrivacy(item.amount)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default TopExpensesWidget;
