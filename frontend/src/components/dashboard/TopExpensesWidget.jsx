import { ArrowDownRight } from 'lucide-react';
import DashboardCard from '../ui/DashboardCard';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatDateBR } from '../../utils/formatters';

function TopExpensesWidget({ expenses }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  const isEmpty = !expenses || expenses.length === 0;

  return (
    <DashboardCard
      icon={ArrowDownRight}
      title="Top 5 despesas"
      description="Maiores gastos do período"
      color="rose"
    >
      {isEmpty ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
            <ArrowDownRight className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">Nenhuma despesa encontrada</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">no período selecionado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((item, index) => (
            <div
              key={item.id}
              className="group/item flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-all duration-200 hover:border-slate-200 hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:border-slate-600/50 dark:hover:bg-slate-800/50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200/80 text-[11px] font-bold tabular-nums text-slate-600 dark:bg-slate-700/60 dark:text-slate-400">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.description}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {item.categoryName}
                  <span className="mx-1.5 opacity-40">•</span>
                  {formatDateBR(item.transactionDate)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                {formatCurrencyPrivacy(item.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

export default TopExpensesWidget;
