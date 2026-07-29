import { PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import AnimatedNumber from '../ui/AnimatedNumber';
import Card from '../ui/Card';
import Tooltip from '../ui/Tooltip';
import TrendBadge from '../ui/TrendBadge';

const cardConfig = {
  balance: {
    Icon: Wallet,
    iconStyle: 'bg-primary/10 text-primary',
    borderStyle: 'hover:border-primary/25',
    tooltipText: 'Saldo consolidado de todas as contas'
  },
  income: {
    Icon: TrendingUp,
    iconStyle: 'bg-info/10 text-info',
    borderStyle: 'hover:border-info/25',
    tooltipText: 'Total de entradas confirmadas'
  },
  expense: {
    Icon: TrendingDown,
    iconStyle: 'bg-danger/10 text-danger',
    borderStyle: 'hover:border-danger/25',
    tooltipText: 'Total de despesas pagas'
  },
  savings: {
    Icon: PiggyBank,
    iconStyle: 'bg-warning/10 text-warning',
    borderStyle: 'hover:border-warning/25',
    tooltipText: 'Receitas menos despesas pagas'
  }
};

function SummaryCard({ title, value, description, comparison, cardType = 'balance' }) {
  const config = cardConfig[cardType] || cardConfig.balance;
  const isPositiveTrend = comparison?.trend === 'up';
  const isNegativeTrend = comparison?.trend === 'down';

  return (
    <Card className={`p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-floating sm:p-6 ${config.borderStyle}`}>
      <div className="flex items-start justify-between gap-3">
        <Tooltip content={config.tooltipText}>
          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${config.iconStyle}`}>
            <config.Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </Tooltip>
        {comparison ? (
          <TrendBadge
            trend={isPositiveTrend ? 'up' : isNegativeTrend ? 'down' : 'flat'}
            value={comparison.value}
            label="vs mês anterior"
          />
        ) : null}
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-muted">{title}</p>
        <AnimatedNumber value={value} className="mt-2 block text-2xl font-bold tracking-[-0.03em] text-content-primary sm:text-3xl" />
        {cardType === 'balance' ? <p className="mt-1 text-xs text-content-muted">Saldo disponível atual</p> : null}
      </div>
      <p className="mt-3 text-xs leading-5 text-content-secondary sm:text-sm">{description}</p>
    </Card>
  );
}

export default SummaryCard;
