import { cn } from '../../utils/cn';

const variantStyles = {
  primary: 'bg-primary text-white shadow-sm hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:ring-primary/20',
  secondary: 'border border-border-ui bg-surface text-content-secondary shadow-sm hover:bg-surface-hover hover:text-content-primary focus-visible:ring-content-muted/20',
  danger: 'bg-danger text-white shadow-sm hover:-translate-y-0.5 hover:bg-danger/90 focus-visible:ring-danger/20',
  ghost: 'text-content-secondary hover:bg-surface-hover hover:text-content-primary focus-visible:ring-content-muted/20',
  lightOnBrand: 'border border-white/30 bg-white text-emerald-800 hover:bg-emerald-50 focus-visible:ring-white/30 dark:bg-white/[0.12] dark:text-white dark:hover:bg-white/[0.18]'
};

const sizeStyles = {
  sm: { height: 'h-9', padding: 'px-3.5', text: 'text-xs' },
  md: { height: 'h-11', padding: 'px-5', text: 'text-sm' },
  lg: { height: 'h-12', padding: 'px-6', text: 'text-sm' }
};

function Button({ as: Component = 'button', variant = 'primary', size = 'md', className = '', type, children, ...props }) {
  const sizeStyle = sizeStyles[size] || sizeStyles.md;
  const hasHeightOverride = /(^|\s)(?:[^\s:]+:)*!?h-/.test(className);
  const hasPaddingOverride = /(^|\s)(?:[^\s:]+:)*!?p(?:[xytrbl])?-/.test(className);
  const hasTextSizeOverride = /(^|\s)(?:[^\s:]+:)*!?text-(?:xs|sm|base|lg|xl|2xl|3xl|\[)/.test(className);

  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[14px] font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        variantStyles[variant] || variantStyles.primary,
        hasHeightOverride ? '' : sizeStyle.height,
        hasPaddingOverride ? '' : sizeStyle.padding,
        hasTextSizeOverride ? '' : sizeStyle.text,
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
