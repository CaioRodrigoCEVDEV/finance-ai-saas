import Card from './ui/Card';

function MetricCard({ title, value, description }) {
  return (
    <Card className="h-full rounded-[28px] transition hover:-translate-y-1 hover:border-emerald-200">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </Card>
  );
}

export default MetricCard;
