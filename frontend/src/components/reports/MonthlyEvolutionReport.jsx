import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { Calendar } from 'lucide-react';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatMonthLabel } from '../../utils/formatters';

function MonthlyEvolutionReport({ data, loading }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} className="h-24 rounded-[28px]" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nenhum dado mensal encontrado"
        description="Ajuste os filtros para visualizar a evolucao mensal."
      />
    );
  }

  const maxIncome = Math.max(...data.map((d) => d.income), 1);
  const maxExpense = Math.max(...data.map((d) => d.expense), 1);
  const maxInvestment = Math.max(...data.map((d) => d.investment), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <Card key={item.month} className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatMonthLabel(item.month)}</h3>
            <span className={`text-sm font-semibold ${item.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              Saldo: {formatCurrencyPrivacy(item.balance)}
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Receitas</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrencyPrivacy(item.income)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(item.income / maxIncome) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Despesas</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">{formatCurrencyPrivacy(item.expense)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: `${(item.expense / maxExpense) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Investimentos</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrencyPrivacy(item.investment)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(item.investment / maxInvestment) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default MonthlyEvolutionReport;
