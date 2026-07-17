import { cn } from '../../utils/cn';

const trendConfig = {
  up: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    arrow: '↑'
  },
  down: {
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-400',
    arrow: '↓'
  },
  flat: {
    bg: 'bg-slate-100 dark:bg-slate-700/50',
    text: 'text-slate-600 dark:text-slate-400',
    arrow: '→'
  },
  positive: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    arrow: '↑'
  },
  negative: {
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-400',
    arrow: '↓'
  }
};

function TrendBadge({ trend = 'flat', value, label, className = '' }) {
  const config = trendConfig[trend] || trendConfig.flat;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        config.bg,
        config.text
      )}>
        <span aria-hidden="true">{config.arrow}</span>
        {value && <span>{value}</span>}
      </span>
      {label && (
        <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
      )}
    </div>
  );
}

export default TrendBadge;
