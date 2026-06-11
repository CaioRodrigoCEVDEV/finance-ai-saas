import { cn } from '../../utils/cn';

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:ring-rose-800',
  neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:ring-sky-800',
  secondary: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-600',
  outline: 'bg-white text-slate-700 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600'
};

function Badge({ variant = 'neutral', className = '', children }) {
  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', variantStyles[variant] || variantStyles.neutral, className)}>{children}</span>;
}

export default Badge;
