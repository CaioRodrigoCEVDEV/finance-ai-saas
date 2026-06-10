import Badge from '../ui/Badge';

import { formatCurrencyBRL, formatPercentage } from '../../utils/formatters';

function ExpenseCategoryList({ items }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">Nenhuma despesa encontrada no mes atual.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={`${item.categoryId || 'uncategorized'}-${item.categoryName}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-slate-900">{item.categoryName}</h3>
                <Badge variant="info">{formatPercentage(item.percentage)}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">do total de despesas</p>
            </div>
            <p className="text-sm font-semibold text-rose-600">{formatCurrencyBRL(item.amount)}</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${Math.min(Number(item.percentage || 0), 100)}%` }}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

export default ExpenseCategoryList;
