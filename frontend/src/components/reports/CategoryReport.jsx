import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { FolderKanban } from 'lucide-react';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

function CategoryReport({ data, loading }) {
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
        icon={FolderKanban}
        title="Nenhuma categoria encontrada"
        description="Ajuste os filtros para visualizar dados por categoria."
      />
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Categoria</th>
              <th className="px-6 py-4 font-medium">Tipo</th>
              <th className="px-6 py-4 font-medium">Valor</th>
              <th className="px-6 py-4 font-medium">Quantidade</th>
              <th className="px-6 py-4 font-medium">Percentual</th>
              <th className="px-6 py-4 font-medium">Visual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={`${item.categoryId}-${item.type}`} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{item.categoryName}</td>
                <td className="px-6 py-4">
                  <span className={
                    item.type === 'INCOME'
                      ? 'text-emerald-600'
                      : item.type === 'EXPENSE'
                        ? 'text-rose-600'
                        : 'text-blue-600'
                  }>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(item.amount)}</td>
                <td className="px-6 py-4 text-slate-600">{item.transactionCount}</td>
                <td className="px-6 py-4 text-slate-600">{item.percentage}%</td>
                <td className="px-6 py-4">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0}%`
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default CategoryReport;
