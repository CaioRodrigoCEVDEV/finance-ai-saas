import Card from '../ui/Card';

const variantStyles = {
  default: 'border-slate-200 bg-white',
  positive: 'border-emerald-200 bg-emerald-50/70',
  negative: 'border-rose-200 bg-rose-50/70',
  highlight: 'border-emerald-200 bg-emerald-50'
};

function SummaryCard({ title, value, description, variant = 'default' }) {
  return (
    <Card className={`rounded-3xl p-6 shadow-glow transition hover:-translate-y-1 ${variantStyles[variant] || variantStyles.default}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{value}</h3>
      <p className="mt-3 text-sm text-slate-500">{description}</p>
    </Card>
  );
}

export default SummaryCard;
