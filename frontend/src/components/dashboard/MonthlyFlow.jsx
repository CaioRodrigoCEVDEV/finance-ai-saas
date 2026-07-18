import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatMonthLabel } from '../../utils/formatters';

const flowRows = [
  { key: 'income', label: 'Receitas', color: 'emerald', Icon: ArrowUpRight },
  { key: 'expense', label: 'Despesas', color: 'rose', Icon: ArrowDownRight },
  { key: 'balance', label: 'Saldo', color: null, Icon: Scale },
];

function EconomyBadge({ economy }) {
  if (economy > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
        Superávit
      </span>
    );
  }

  if (economy < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20">
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
        Déficit
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-700/40 dark:text-slate-400 dark:ring-slate-600/30">
      <Minus className="h-3 w-3" aria-hidden="true" />
      Equilibrado
    </span>
  );
}

function FlowRow({ label, value, color, Icon, maxValue, economy }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  let resolvedColor = color;
  let textColor = '';
  if (label === 'Saldo') {
    resolvedColor = economy > 0 ? 'emerald' : economy < 0 ? 'rose' : 'slate';
    textColor = economy > 0 ? 'text-emerald-600 dark:text-emerald-400' : economy < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400';
  } else if (label === 'Receitas') {
    textColor = 'text-emerald-600 dark:text-emerald-400';
  } else {
    textColor = 'text-rose-600 dark:text-rose-400';
  }

  const displayValue = label === 'Saldo' ? economy : value;
  const barPercent = maxValue > 0 ? (Math.abs(displayValue) / maxValue) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        resolvedColor === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
        resolvedColor === 'rose' ? 'bg-rose-50 dark:bg-rose-500/10' :
        'bg-slate-100 dark:bg-slate-700/30'
      }`}>
        <Icon className={`h-4 w-4 ${
          resolvedColor === 'emerald' ? 'text-emerald-500 dark:text-emerald-400' :
          resolvedColor === 'rose' ? 'text-rose-500 dark:text-rose-400' :
          'text-slate-400 dark:text-slate-500'
        }`} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
          <span className={`text-sm font-bold tabular-nums whitespace-nowrap ${textColor}`}>
            {formatCurrencyPrivacy(displayValue)}
          </span>
        </div>
        <div className="mt-1.5">
          <ProgressBar
            value={barPercent}
            color={resolvedColor}
            height="h-2.5"
            animate={true}
            showShine={true}
          />
        </div>
      </div>
    </div>
  );
}

function MonthlyFlow({ items }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
          <Scale className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">Nenhuma movimentação encontrada</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">neste período</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...items.flatMap((item) => [Number(item.income || 0), Number(item.expense || 0), Math.abs(Number(item.economy || 0))]),
    1
  );

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const economy = Number(item.economy || 0);
        const absEconomy = Math.abs(economy);

        return (
          <article
            key={item.month}
            className="group rounded-2xl border border-slate-100 bg-white/60 p-4
              transition-all duration-200 ease-out
              hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)]
              dark:border-slate-700/40 dark:bg-slate-800/20 dark:hover:border-slate-600/50 dark:hover:bg-slate-800/40 dark:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)]"
          >
            {/* Cabeçalho do mês */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">
                {formatMonthLabel(item.month)}
              </h3>
              <EconomyBadge economy={economy} />
            </div>

            {/* Indicadores */}
            <div className="space-y-3.5">
              {flowRows.map((row) => (
                <FlowRow
                  key={row.key}
                  label={row.label}
                  value={row.key === 'income' ? item.income : item.expense}
                  color={row.color}
                  Icon={row.Icon}
                  maxValue={maxValue}
                  economy={economy}
                />
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default MonthlyFlow;
