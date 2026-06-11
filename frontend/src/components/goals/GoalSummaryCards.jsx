import Card from '../ui/Card';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { formatCurrencyBRL, formatPercentage } from '../../utils/formatters';

function SummaryItem({ label, value, prefix, suffix, isCurrency, isPercentage, loading }) {
  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 p-6 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</p>
      {loading ? (
        <LoadingSkeleton className="mt-3 h-8 w-32 rounded-xl" />
      ) : (
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {prefix}
          {isCurrency ? formatCurrencyBRL(value) : isPercentage ? formatPercentage(value) : value}
          {suffix}
        </p>
      )}
    </Card>
  );
}

function GoalSummaryCards({ summary, loading }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <SummaryItem label="Total de metas" value={summary.totalGoals} loading={loading} />
      <SummaryItem label="Metas ativas" value={summary.activeGoals} loading={loading} />
      <SummaryItem label="Metas concluidas" value={summary.completedGoals} loading={loading} />
      <SummaryItem label="Progresso geral" value={summary.overallProgressPercentage} isPercentage loading={loading} />
    </div>
  );
}

export default GoalSummaryCards;
