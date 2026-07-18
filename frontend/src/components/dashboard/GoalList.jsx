import { TrendingUp, CalendarDays, Trophy } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatDateBR } from '../../utils/formatters';
import { getGoalIcon } from '../../utils/goalIcons';

function getProgressColor(pct) {
  if (pct >= 90) return 'emerald';
  if (pct >= 60) return 'sky';
  if (pct >= 30) return 'emerald';
  return 'blue';
}

function getProgressBadge(pct) {
  if (pct >= 90) return { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20', label: `${pct.toFixed(0)}%` };
  if (pct >= 60) return { bg: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20', label: `${pct.toFixed(0)}%` };
  if (pct >= 30) return { bg: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20', label: `${pct.toFixed(0)}%` };
  return { bg: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20', label: `${pct.toFixed(0)}%` };
}

function GoalItem({ item }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const Icon = getGoalIcon(item.name);
  const pct = Number(item.progressPercentage || 0);
  const isCompleted = pct >= 100;
  const barColor = getProgressColor(pct);
  const badge = isCompleted
    ? { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20', label: 'Concluída' }
    : getProgressBadge(pct);

  return (
    <article
      className="group rounded-2xl border border-slate-100 bg-white/60 p-4
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)]
        dark:border-slate-700/40 dark:bg-slate-800/20 dark:hover:border-slate-600/50 dark:hover:bg-slate-800/40 dark:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)]"
    >
      {/* Linha 1: Ícone + Nome + Valores */}
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-100 dark:bg-slate-700/50'}`}>
          {isCompleted
            ? <Trophy className="h-4.5 w-4.5 text-emerald-500 dark:text-emerald-400" strokeWidth={2} aria-hidden="true" />
            : <Icon className={`h-4.5 w-4.5 ${isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`} strokeWidth={2} aria-hidden="true" />
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrencyPrivacy(item.currentAmount)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            / {formatCurrencyPrivacy(item.targetAmount)}
          </p>
        </div>
      </div>

      {/* Linha 2: Prazo + Badge de progresso */}
      <div className="mt-3 flex items-center gap-2 pl-12">
        {item.deadline && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            {formatDateBR(item.deadline)}
          </span>
        )}
        <span className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${badge.bg}`}>
          {badge.label}
        </span>
      </div>

      {/* Linha 3: Progress Bar */}
      <div className="mt-3 pl-12">
        <ProgressBar
          value={pct}
          color={barColor}
          height="h-2.5"
          animate={true}
          showShine={true}
        />
      </div>
    </article>
  );
}

function GoalList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
          <TrendingUp className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">Nenhuma meta ativa</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">no período selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <GoalItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export default GoalList;
