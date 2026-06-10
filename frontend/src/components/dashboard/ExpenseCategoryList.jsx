import { formatCurrencyBRL, formatPercentage } from '../../utils/formatters';

function ExpenseCategoryList({ items }) {
  if (!items.length) {
    return <p className="text-sm text-slate-400">Nenhuma despesa encontrada no mes atual.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={`${item.categoryId || 'uncategorized'}-${item.categoryName}`} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-white">{item.categoryName}</h3>
              <p className="mt-1 text-xs text-slate-400">{formatPercentage(item.percentage)} do total de despesas</p>
            </div>
            <p className="text-sm font-semibold text-rose-300">{formatCurrencyBRL(item.amount)}</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-cyan-300"
              style={{ width: `${Math.min(Number(item.percentage || 0), 100)}%` }}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

export default ExpenseCategoryList;
