import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { ArrowDown } from 'lucide-react';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

function formatCurrency(value) {
  return formatCurrencyBRL(value);
}

function formatDate(value) {
  if (!value) return '-';
  return formatDateBR(value);
}

function TopExpensesReport({ data, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <LoadingSkeleton key={i} className="h-16 rounded-[28px]" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={ArrowDown}
        title="Nenhuma despesa encontrada"
        description="Ajuste os filtros para visualizar as maiores despesas."
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <Card key={item.id} className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <ArrowDown className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.description}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {item.categoryName || 'Sem categoria'}
              {item.accountName ? ` • ${item.accountName}` : ''}
              {item.creditCardName ? ` • ${item.creditCardName}` : ''}
              {item.transactionDate ? ` • ${formatDate(item.transactionDate)}` : ''}
            </p>
          </div>
          <div className="shrink-0 text-sm font-semibold text-rose-600">
            {formatCurrency(item.amount)}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default TopExpensesReport;
