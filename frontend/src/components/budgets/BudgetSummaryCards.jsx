import { PiggyBank, ShieldAlert, Target, TrendingUp } from 'lucide-react';

import Card from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatPercentage } from '../../utils/formatters';

function BudgetSummaryCards({ summary }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  const items = [
    { label: 'Orcamento total', value: formatCurrencyPrivacy(summary.totalBudget), icon: PiggyBank },
    { label: 'Utilizado', value: formatCurrencyPrivacy(summary.totalUsed), icon: TrendingUp },
    { label: 'Disponivel', value: formatCurrencyPrivacy(summary.totalRemaining), icon: Target },
    { label: 'Percentual usado', value: formatPercentage(summary.usedPercentage), icon: ShieldAlert }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white/95 p-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-3 truncate text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{item.value}</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
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
