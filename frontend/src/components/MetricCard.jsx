function MetricCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-white/5 p-5 shadow-glow backdrop-blur-sm transition hover:-translate-y-1 hover:border-brand-400/40">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default MetricCard;
