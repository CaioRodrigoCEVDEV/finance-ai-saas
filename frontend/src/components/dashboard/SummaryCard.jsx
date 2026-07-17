import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import Card from '../ui/Card';
import AnimatedNumber from '../ui/AnimatedNumber';
import TrendBadge from '../ui/TrendBadge';
import Tooltip from '../ui/Tooltip';

const cardConfig = {
  balance: {
    icon: Wallet,
    color: 'emerald',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    glowColor: 'shadow-[0_0_24px_rgba(16,185,129,0.1)]',
    borderHover: 'hover:border-emerald-200 dark:hover:border-emerald-800',
    sparkStroke: '#10b981',
    sparkFill: 'rgba(16,185,129,0.08)',
    valuePrefix: '',
    tooltipText: 'Saldo consolidado de todas as contas'
  },
  income: {
    icon: TrendingUp,
    color: 'blue',
    iconBg: 'bg-blue-50 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
    glowColor: 'shadow-[0_0_24px_rgba(59,130,246,0.1)]',
    borderHover: 'hover:border-blue-200 dark:hover:border-blue-800',
    sparkStroke: '#3b82f6',
    sparkFill: 'rgba(59,130,246,0.08)',
    valuePrefix: '',
    tooltipText: 'Total de entradas confirmadas'
  },
  expense: {
    icon: TrendingDown,
    color: 'rose',
    iconBg: 'bg-rose-50 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-400',
    glowColor: 'shadow-[0_0_24px_rgba(244,63,94,0.1)]',
    borderHover: 'hover:border-rose-200 dark:hover:border-rose-800',
    sparkStroke: '#f43f5e',
    sparkFill: 'rgba(244,63,94,0.08)',
    valuePrefix: '',
    tooltipText: 'Total de despesas pagas'
  },
  savings: {
    icon: PiggyBank,
    color: 'amber',
    iconBg: 'bg-amber-50 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    glowColor: 'shadow-[0_0_24px_rgba(245,158,11,0.1)]',
    borderHover: 'hover:border-amber-200 dark:hover:border-amber-800',
    sparkStroke: '#f59e0b',
    sparkFill: 'rgba(245,158,11,0.08)',
    valuePrefix: '',
    tooltipText: 'Receitas menos despesas pagas'
  }
};

function MiniSparkline({ trend, stroke, fill }) {
  const isPositive = trend === 'up';
  const points = isPositive
    ? '0,18 8,14 16,16 24,10 32,12 40,4 48,6'
    : trend === 'down'
      ? '0,6 8,8 16,4 24,10 32,8 40,16 48,14'
      : '0,10 8,10 16,10 24,10 32,10 40,10 48,10';

  return (
    <svg viewBox="0 0 48 22" className="h-6 w-full sm:h-7" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`sparkFill-${stroke}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,22 ${points} 48,22`}
        fill={`url(#sparkFill-${stroke})`}
        className="dark:fill-white/5"
      />
    </svg>
  );
}

function SummaryCard({ title, value, description, variant = 'default', comparison, cardType = 'balance' }) {
  const config = cardConfig[cardType] || cardConfig.balance;
  const Icon = config.icon;
  const isPositiveTrend = comparison?.trend === 'up';
  const isNegativeTrend = comparison?.trend === 'down';

  return (
    <Card
      className={`rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-5 sm:p-6
        dark:from-slate-800 dark:to-slate-800/80
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.01]
        hover:shadow-glow dark:hover:shadow-glow-dark ${config.borderHover}
        group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" aria-hidden="true" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <Tooltip content={config.tooltipText}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${config.iconBg} transition-shadow duration-300 group-hover:shadow-md`}>
              <Icon className={`h-5 w-5 ${config.iconText}`} aria-hidden="true" />
            </div>
          </Tooltip>
          {comparison && (
            <TrendBadge
              trend={isPositiveTrend ? 'up' : isNegativeTrend ? 'down' : 'flat'}
              value={comparison.value}
              label="vs mês anterior"
            />
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 sm:text-sm">
            {title}
          </p>
          <AnimatedNumber
            value={value}
            className="mt-2 block text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl"
          />
          {cardType === 'balance' && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Saldo disponível</p>
          )}
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{description}</p>

        <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

        <div className="border-t border-slate-100 pt-3 dark:border-slate-700/50">
          <MiniSparkline
            trend={comparison?.trend || 'flat'}
            stroke={config.sparkStroke}
            fill={config.sparkFill}
          />
        </div>
      </div>
    </Card>
  );
}

export default SummaryCard;
