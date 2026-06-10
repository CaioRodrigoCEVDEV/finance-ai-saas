const variantStyles = {
  default: 'border-slate-800 bg-white/5',
  positive: 'border-emerald-500/30 bg-emerald-500/10',
  negative: 'border-rose-500/30 bg-rose-500/10',
  highlight: 'border-brand-400/30 bg-brand-500/10'
};

function SummaryCard({ title, value, description, variant = 'default' }) {
  return (
    <article
      className={`rounded-3xl border p-6 shadow-glow backdrop-blur-sm transition hover:-translate-y-1 ${variantStyles[variant] || variantStyles.default}`}
    >
      <p className="text-sm text-slate-300">{title}</p>
      <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</h3>
      <p className="mt-3 text-sm text-slate-400">{description}</p>
    </article>
  );
}

export default SummaryCard;
