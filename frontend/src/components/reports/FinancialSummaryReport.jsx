import { TrendingDown, TrendingUp, PiggyBank, Scale } from 'lucide-react';

import Card from '../ui/Card';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { formatCurrencyBRL } from '../../utils/formatters';

function formatCurrency(value) {
  return formatCurrencyBRL(value);
}

function SummaryCard({ icon: Icon, label, value, colorClass, iconBgClass }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBgClass} dark:bg-opacity-30`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </Card>
  );
}

function FinancialSummaryReport({ data, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} className="h-24 rounded-[28px]" />
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={TrendingUp}
        label="Receitas"
        value={formatCurrency(data.income)}
        colorClass="text-emerald-600"
        iconBgClass="bg-emerald-50"
      />
      <SummaryCard
        icon={TrendingDown}
        label="Despesas"
        value={formatCurrency(data.expense)}
        colorClass="text-rose-600"
        iconBgClass="bg-rose-50"
      />
      <SummaryCard
        icon={PiggyBank}
        label="Investimentos"
        value={formatCurrency(data.investment)}
        colorClass="text-blue-600"
        iconBgClass="bg-blue-50"
      />
      <SummaryCard
        icon={Scale}
        label="Saldo do periodo"
        value={formatCurrency(data.balance)}
        colorClass={data.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}
        iconBgClass={data.balance >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}
      />
    </div>
  );
}

export default FinancialSummaryReport;
