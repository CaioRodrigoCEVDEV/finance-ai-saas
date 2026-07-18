import { BarChart3, CircleAlert, CircleCheck, CircleMinus } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatBudgetStatus } from '../../utils/formatters';
import { getCategoryIcon, getCategoryColor } from '../../utils/categoryIcons';

const statusConfig = {
  SAFE: {
    Icon: CircleCheck,
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
    bar: 'emerald',
    label: 'Dentro do orçamento',
  },
  WARNING: {
    Icon: CircleAlert,
    badge: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
    bar: 'amber',
    label: 'Quase no limite',
  },
  EXCEEDED: {
    Icon: CircleAlert,
    badge: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
    bar: 'rose',
    label: 'Excedido',
  },
};

function BudgetItem({ item }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const config = statusConfig[item.status] || statusConfig.SAFE;
  const StatusIcon = config.Icon;
  const Icon = getCategoryIcon(item.categoryName);

  return (
    <article
      className="group rounded-2xl border border-slate-100 bg-white/60 p-4
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)]
        dark:border-slate-700/40 dark:bg-slate-800/20 dark:hover:border-slate-600/50 dark:hover:bg-slate-800/40 dark:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)]"
    >
      {/* Linha 1: Categoria + Nome + Valores */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700/50">
          <Icon className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.categoryName}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrencyPrivacy(item.usedAmount)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            / {formatCurrencyPrivacy(item.amount)}
          </p>
        </div>
      </div>

      {/* Linha 2: Badge de status */}
      <div className="mt-3 flex items-center gap-2 pl-12">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${config.badge}`}>
          <StatusIcon className="h-3 w-3" aria-hidden="true" />
          {config.label}
        </span>
      </div>

      {/* Linha 3: Progress Bar */}
      <div className="mt-3 pl-12">
        <ProgressBar
          value={Number(item.usedPercentage || 0)}
          color={config.bar}
          height="h-2.5"
          animate={true}
          showShine={true}
        />
      </div>
    </article>
  );
}

function BudgetList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
          <BarChart3 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">Nenhum orçamento encontrado</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">para o período selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <BudgetItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export default BudgetList;
