import { ArrowDownRight } from 'lucide-react';
import DashboardCard from '../ui/DashboardCard';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatDateBR } from '../../utils/formatters';
import { getCategoryIcon, getCategoryColor } from '../../utils/categoryIcons';

const rankStyles = [
  { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-200 dark:ring-amber-500/30' },
  { bg: 'bg-slate-200 dark:bg-slate-500/15', text: 'text-slate-600 dark:text-slate-300', ring: 'ring-slate-300 dark:ring-slate-500/30' },
  { bg: 'bg-orange-100 dark:bg-orange-500/15', text: 'text-orange-700 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-500/30' },
  { bg: 'bg-slate-100 dark:bg-slate-600/15', text: 'text-slate-500 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-600/30' },
  { bg: 'bg-slate-100 dark:bg-slate-600/15', text: 'text-slate-500 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-600/30' },
];

function RankBadge({ index }) {
  const style = rankStyles[index] || rankStyles[4];
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${style.bg} ${style.text} ${style.ring}`}
    >
      <span className="text-xs font-bold tabular-nums">{index + 1}</span>
    </span>
  );
}

function ExpenseItem({ item, index }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const Icon = getCategoryIcon(item.categoryName);
  const catColor = getCategoryColor(item.categoryName);

  return (
    <div
      className="group/item flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white/60 px-4 py-3.5
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)]
        dark:border-slate-700/40 dark:bg-slate-800/20 dark:hover:border-slate-600/50 dark:hover:bg-slate-800/40 dark:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)]"
    >
      <RankBadge index={index} />

      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${catColor.bg}`}>
        <Icon className={`h-4 w-4 ${catColor.text}`} strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.description}</p>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">{item.categoryName}</span>
          <span className="shrink-0 opacity-40">·</span>
          <span className="shrink-0">{formatDateBR(item.transactionDate)}</span>
        </div>
      </div>

      <p className="shrink-0 text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
        {formatCurrencyPrivacy(item.amount)}
      </p>
    </div>
  );
}

function TopExpensesWidget({ expenses, collapseKey }) {
  const isEmpty = !expenses || expenses.length === 0;

  return (
    <DashboardCard
      icon={ArrowDownRight}
      title="Top 5 despesas"
      description="Maiores gastos do período"
      color="rose"
      collapseKey={collapseKey}
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
        <div className="space-y-2.5">
          {expenses.map((item, index) => (
            <ExpenseItem key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

export default TopExpensesWidget;
