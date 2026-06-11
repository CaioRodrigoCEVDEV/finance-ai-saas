import Card from '../ui/Card';

const variantStyles = {
  default: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
  positive: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-900/30',
  negative: 'border-rose-200 bg-rose-50/70 dark:border-rose-800 dark:bg-rose-900/30',
  highlight: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30'
};

function SummaryCard({ title, value, description, variant = 'default' }) {
  return (
    <Card className={`rounded-3xl p-6 shadow-glow transition hover:-translate-y-1 ${variantStyles[variant] || variantStyles.default}`}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</h3>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </Card>
  );
}

export default SummaryCard;
