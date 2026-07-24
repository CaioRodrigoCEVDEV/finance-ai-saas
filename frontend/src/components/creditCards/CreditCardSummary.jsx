import { CreditCard, Layers3, Wallet } from 'lucide-react';

import Card from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { getCreditCardSummary } from '../../utils/creditCardMetrics';

function CreditCardSummary({ cards }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  const totals = getCreditCardSummary(cards);

  const items = [
    { label: 'Total de limite', value: formatCurrencyPrivacy(totals.limitAmount), icon: Wallet },
    { label: 'Limite disponivel', value: formatCurrencyPrivacy(totals.availableLimit), icon: Layers3 },
    { label: 'Cartoes ativos', value: String(totals.activeCards), icon: CreditCard }
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="rounded-[28px] border-slate-200/80 bg-white/95 p-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{item.value}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default CreditCardSummary;
