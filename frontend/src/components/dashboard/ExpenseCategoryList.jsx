import { Layers3, TrendingDown, TrendingUp, Minus, Sparkles } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatPercentage } from '../../utils/formatters';
import { getCategoryIcon, getCategoryColor } from '../../utils/categoryIcons';

function TrendIndicator({ trend, deltaPercentage, hasPrevious }) {
  if (!hasPrevious) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700/40 dark:text-slate-400">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Novo
      </span>
    );
  }

  const absDelta = Math.abs(deltaPercentage || 0);
  if (absDelta === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700/40 dark:text-slate-400">
        <Minus className="h-3 w-3" aria-hidden="true" />
        Estável
      </span>
    );
  }

  const isDown = trend === 'down';
  const Icon = isDown ? TrendingDown : TrendingUp;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold
        ${isDown
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
        }`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {absDelta.toFixed(1)}%
    </span>
  );
}

function CategoryItem({ item }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const trend = item.trend || (item.deltaPercentage > 0 ? 'up' : item.deltaPercentage < 0 ? 'down' : 'flat');
  const hasPrevious = Number(item.previousAmount || 0) > 0;
  const Icon = getCategoryIcon(item.categoryName);
  const catColor = getCategoryColor(item.categoryName);

  return (
    <article
      className={`group rounded-2xl border border-slate-100 bg-white/60 p-4
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)]
        dark:border-slate-700/40 dark:bg-slate-800/20 dark:hover:border-slate-600/50 dark:hover:bg-slate-800/40 dark:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)]`}
    >
      {/* Linha 1: Ícone + Nome + Badge % + Valor */}
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${catColor.bg} transition-shadow duration-200 group-hover:shadow-sm`}>
          <Icon className={`h-4.5 w-4.5 ${catColor.text}`} strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.categoryName}</h3>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
              {formatPercentage(item.percentage)}
            </span>
          </div>
        </div>
        <p className="shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
          {formatCurrencyPrivacy(item.amount)}
        </p>
      </div>

      {/* Linha 2: Indicador de tendência */}
      <div className="mt-2.5 flex items-center gap-2 pl-12">
        <TrendIndicator trend={trend} deltaPercentage={item.deltaPercentage} hasPrevious={hasPrevious} />
        {hasPrevious && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">vs mês anterior</span>
        )}
      </div>

      {/* Linha 3: Progress Bar Premium */}
      <div className="mt-3 pl-12">
        <ProgressBar
          value={Number(item.percentage || 0)}
          color={catColor.bar}
          height="h-2.5"
          animate={true}
          showShine={true}
        />
      </div>
    </article>
  );
}

function ExpenseCategoryList({ items }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
          <Layers3 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">Nenhuma despesa encontrada</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">no período selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CategoryItem
          key={`${item.categoryId || 'uncategorized'}-${item.categoryName}`}
          item={item}
          formatCurrencyPrivacy={formatCurrencyPrivacy}
        />
      ))}
    </div>
  );
}

export default ExpenseCategoryList;
