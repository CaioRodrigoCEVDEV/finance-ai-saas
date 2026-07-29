import { cn } from '../../utils/cn';

function Card({ as: Component = 'div', className = '', children, ...props }) {
  const hasPaddingOverride = /(^|\s)!?p(?:[trblxy])?-(?:\[[^\]]+\]|[^\s]+)/.test(className);
  const hasBackgroundOverride = /(^|\s)!?bg-(?:\[[^\]]+\]|[^\s]+)/.test(className);

  return (
    <Component
      className={cn(
        'w-full max-w-full !rounded-[22px] border border-border-soft text-content-primary shadow-card transition-colors',
        hasBackgroundOverride ? '' : 'bg-surface',
        hasPaddingOverride ? '' : 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;
