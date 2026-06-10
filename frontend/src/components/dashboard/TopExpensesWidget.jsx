import { ArrowDownRight } from 'lucide-react';
import Card from '../ui/Card';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

function TopExpensesWidget({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <Card className="rounded-[28px] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <ArrowDownRight className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Top 5 despesas</h2>
        </div>
        <p className="text-sm text-slate-500">Nenhuma despesa encontrada no mês atual.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-[28px] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
          <ArrowDownRight className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Top 5 despesas</h2>
      </div>

      <div className="space-y-3">
        {expenses.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.description}</p>
              <p className="text-xs text-slate-500">
                {item.categoryName} • {formatDateBR(item.transactionDate)}
              </p>
            </div>
            <p className="text-sm font-semibold text-rose-600">{formatCurrencyBRL(item.amount)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default TopExpensesWidget;
