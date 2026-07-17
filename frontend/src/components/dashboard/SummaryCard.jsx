import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import Card from '../ui/Card';

const cardConfig = {
  balance: {
    icon: Wallet,
    borderColor: 'border-l-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    glowColor: 'shadow-[inset_0_1px_0_0_rgba(16,185,129,0.1)]',
    badgePositive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    badgeNegative: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    sparkStroke: '#10b981',
    sparkFill: 'rgba(16,185,129,0.08)',
    sparkFillDark: 'rgba(16,185,129,0.15)'
  },
  income: {
    icon: TrendingUp,
    borderColor: 'border-l-blue-500',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    glowColor: 'shadow-[inset_0_1px_0_0_rgba(59,130,246,0.1)]',
    badgePositive: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    badgeNegative: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    sparkStroke: '#3b82f6',
    sparkFill: 'rgba(59,130,246,0.08)',
    sparkFillDark: 'rgba(59,130,246,0.15)'
  },
  expense: {
    icon: TrendingDown,
    borderColor: 'border-l-rose-500',
    iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    glowColor: 'shadow-[inset_0_1px_0_0_rgba(244,63,94,0.1)]',
    badgePositive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    badgeNegative: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    sparkStroke: '#f43f5e',
    sparkFill: 'rgba(244,63,94,0.08)',
    sparkFillDark: 'rgba(244,63,94,0.15)'
  },
  savings: {
    icon: PiggyBank,
    borderColor: 'border-l-amber-500',
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    glowColor: 'shadow-[inset_0_1px_0_0_rgba(245,158,11,0.1)]',
    badgePositive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    badgeNegative: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    sparkStroke: '#f59e0b',
    sparkFill: 'rgba(245,158,11,0.08)',
    sparkFillDark: 'rgba(245,158,11,0.15)'
  }
};

function MiniSparkline({ trend, stroke, fill, fillDark }) {
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

  const badgeClass = isPositiveTrend
    ? config.badgePositive
    : isNegativeTrend
      ? config.badgeNegative
      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';

  return (
    <Card
      className={`rounded-3xl border-l-4 p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-l-4 ${config.borderColor} ${config.glowColor} animate-fade-in animate-slide-up dark:bg-slate-800`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.iconBg}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm">
          {title}
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {value}
        </h3>
        {cardType === 'balance' && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Saldo disponível</p>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{description}</p>

      <div className="my-3 h-px bg-slate-200 dark:bg-slate-700" />

      {comparison ? (
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
            <span aria-hidden="true">{isPositiveTrend ? '▲' : isNegativeTrend ? '▼' : '•'}</span>
            <span>{comparison.value}</span>
          </div>
          <span className="hidden text-xs text-slate-400 dark:text-slate-500 sm:inline">{comparison.label}</span>
        </div>
      ) : null}

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700/50">
        <MiniSparkline
          trend={comparison?.trend || 'flat'}
          stroke={config.sparkStroke}
          fill={config.sparkFill}
          fillDark={config.sparkFillDark}
        />
      </div>
    </Card>
  );
}

export default SummaryCard;
