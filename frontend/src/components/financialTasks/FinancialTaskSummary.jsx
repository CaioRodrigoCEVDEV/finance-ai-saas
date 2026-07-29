import Card from '../ui/Card';
import LoadingSkeleton from '../ui/LoadingSkeleton';

function SummaryItem({ label, value, loading, variant = '' }) {
  const valueClass = variant
    ? `mt-3 text-2xl font-semibold tracking-tight ${variant}`
    : 'mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100';

  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 p-6 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</p>
      {loading ? (
        <LoadingSkeleton className="mt-3 h-8 w-24 rounded-xl" />
      ) : (
        <p className={valueClass}>{value}</p>
      )}
    </Card>
  );
}

function FinancialTaskSummary({ summary, loading }) {
  return (
    <div className="grid w-full max-w-full gap-5 md:grid-cols-2 min-[1521px]:grid-cols-4">
      <SummaryItem label="Pendentes" value={summary.pending} loading={loading} />
      <SummaryItem label="Atrasadas" value={summary.overdue} loading={loading} variant="text-rose-600 dark:text-rose-400" />
      <SummaryItem label="Hoje" value={summary.today || 0} loading={loading} variant="text-amber-600 dark:text-amber-400" />
      <SummaryItem label="Concluidas" value={summary.completed} loading={loading} variant="text-emerald-600 dark:text-emerald-400" />
    </div>
  );
}

export default FinancialTaskSummary;
