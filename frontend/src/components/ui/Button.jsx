import { cn } from '../../utils/cn';

const variantStyles = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 focus-visible:ring-slate-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-200',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 focus-visible:ring-slate-200'
};

const sizeStyles = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base'
};

function Button({ as: Component = 'button', variant = 'primary', size = 'md', className = '', type, children, ...props }) {
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      type={Component === 'button' ? type || 'button' : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
