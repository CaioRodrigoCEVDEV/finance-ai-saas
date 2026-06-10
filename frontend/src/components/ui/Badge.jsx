import { cn } from '../../utils/cn';

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  secondary: 'bg-slate-50 text-slate-700 ring-1 ring-slate-200',
  outline: 'bg-white text-slate-700 ring-1 ring-slate-300'
};

function Badge({ variant = 'neutral', className = '', children }) {
  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', variantStyles[variant] || variantStyles.neutral, className)}>{children}</span>;
}

export default Badge;
