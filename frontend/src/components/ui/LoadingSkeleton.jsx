import { cn } from '../../utils/cn';

function LoadingSkeleton({ className = '', variant = 'default' }) {
  if (variant === 'shimmer') {
    return (
      <div className={cn('skeleton-shimmer rounded-[22px] bg-surface-secondary', className)} />
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-[22px] bg-surface-secondary', className)}>
      <div className="absolute inset-0 animate-pulse">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
