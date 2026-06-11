import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { Landmark } from 'lucide-react';
import { formatCurrencyBRL } from '../../utils/formatters';

function formatCurrency(value) {
  return formatCurrencyBRL(value);
}

function AccountReport({ data, loading }) {
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
        icon={Landmark}
        title="Nenhuma conta encontrada"
        description="Ajuste os filtros para visualizar dados por conta."
      />
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Conta</th>
              <th className="px-6 py-4 font-medium">Receitas</th>
              <th className="px-6 py-4 font-medium">Despesas</th>
              <th className="px-6 py-4 font-medium">Saldo</th>
              <th className="px-6 py-4 font-medium">Quantidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.map((item) => (
              <tr key={item.accountId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.accountName}</td>
                <td className="px-6 py-4 text-emerald-600">{formatCurrency(item.income)}</td>
                <td className="px-6 py-4 text-rose-600">{formatCurrency(item.expense)}</td>
                <td className={`px-6 py-4 font-semibold ${item.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(item.balance)}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.transactionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default AccountReport;
