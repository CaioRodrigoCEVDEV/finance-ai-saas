import { CreditCard, Layers3, TrendingUp, Wallet } from 'lucide-react';

import Card from '../ui/Card';
import { formatCurrencyBRL } from '../../utils/formatters';

function CreditCardSummary({ cards }) {
  const totals = cards.reduce((accumulator, card) => ({
    limitAmount: accumulator.limitAmount + Number(card.limitAmount || 0),
    currentInvoiceAmount: accumulator.currentInvoiceAmount + Number(card.currentInvoiceAmount || 0),
    availableLimit: accumulator.availableLimit + Number(card.availableLimit || 0),
    activeCards: accumulator.activeCards + (card.isActive ? 1 : 0)
  }), {
    limitAmount: 0,
    currentInvoiceAmount: 0,
    availableLimit: 0,
    activeCards: 0
  });

  const items = [
    { label: 'Total de limite', value: formatCurrencyBRL(totals.limitAmount), icon: Wallet },
    { label: 'Total utilizado no mes', value: formatCurrencyBRL(totals.currentInvoiceAmount), icon: TrendingUp },
    { label: 'Limite disponivel', value: formatCurrencyBRL(totals.availableLimit), icon: Layers3 },
    { label: 'Cartoes ativos', value: String(totals.activeCards), icon: CreditCard }
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

export default CreditCardSummary;
