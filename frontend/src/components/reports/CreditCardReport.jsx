import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { CreditCard } from 'lucide-react';
import { formatCurrencyBRL } from '../../utils/formatters';

function formatCurrency(value) {
  return formatCurrencyBRL(value);
}

function CreditCardReport({ data, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} className="h-16 rounded-[28px]" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Nenhum cartao encontrado"
        description="Ajuste os filtros para visualizar dados por cartao de credito."
      />
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Cartao</th>
              <th className="px-6 py-4 font-medium">Despesas</th>
              <th className="px-6 py-4 font-medium">Quantidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.map((item) => (
              <tr key={item.creditCardId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.creditCardName}</td>
                <td className="px-6 py-4 text-rose-600 dark:text-rose-400">{formatCurrency(item.expense)}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.transactionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default CreditCardReport;
