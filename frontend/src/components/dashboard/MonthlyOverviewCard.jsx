import { CreditCard, TrendingDown, TrendingUp } from 'lucide-react';

import { usePrivacy } from '../../contexts/PrivacyContext';
import Card from '../ui/Card';

const rows = [
  { key: 'monthlyIncome', label: 'Receitas', Icon: TrendingUp, tone: 'success' },
  { key: 'monthlyExpensePaid', label: 'Despesas', Icon: TrendingDown, tone: 'danger' },
  { key: 'monthlyCreditCardSpent', label: 'Despesas no crédito', Icon: CreditCard, tone: 'warning' }
];

const toneClasses = {
  success: { icon: 'bg-success/10 text-success', bar: 'bg-success', value: 'text-success' },
  danger: { icon: 'bg-danger/10 text-danger', bar: 'bg-danger', value: 'text-danger' },
  warning: { icon: 'bg-warning/10 text-warning', bar: 'bg-warning', value: 'text-warning' }
};

function MonthlyOverviewCard({ periodLabel, summary }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const values = rows.map((row) => Number(summary?.[row.key]) || 0);
  const maxValue = Math.max(...values, 1);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-[-0.02em] text-content-primary">Visão geral do mês</h2>
        <span className="text-xs font-semibold capitalize text-content-secondary">{periodLabel}</span>
      </div>

      <div className="mt-4 space-y-4">
        {rows.map((row, index) => {
          const tone = toneClasses[row.tone];
          const value = values[index];
          const width = value > 0 ? Math.max((value / maxValue) * 100, 4) : 0;

          return (
            <div key={row.key} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone.icon}`}>
                <row.Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-content-primary">{row.label}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-secondary">
                  <div className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`} style={{ width: `${width}%` }} />
                </div>
              </div>
              <span className={`min-w-[92px] text-right text-sm font-bold ${tone.value}`}>
                {formatCurrencyPrivacy(value)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default MonthlyOverviewCard;
