import { PiggyBank, ShieldAlert, Target, TrendingUp } from 'lucide-react';

import Card from '../ui/Card';
import { formatCurrencyBRL, formatPercentage } from '../../utils/formatters';

function BudgetSummaryCards({ summary }) {
  const items = [
    { label: 'Orcamento total', value: formatCurrencyBRL(summary.totalBudget), icon: PiggyBank },
    { label: 'Utilizado', value: formatCurrencyBRL(summary.totalUsed), icon: TrendingUp },
    { label: 'Disponivel', value: formatCurrencyBRL(summary.totalRemaining), icon: Target },
    { label: 'Percentual usado', value: formatPercentage(summary.usedPercentage), icon: ShieldAlert }
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="rounded-[28px] border-slate-200/80 bg-white/95 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default BudgetSummaryCards;
