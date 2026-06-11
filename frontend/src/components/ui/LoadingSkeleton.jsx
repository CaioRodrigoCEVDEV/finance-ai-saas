import { cn } from '../../utils/cn';

function LoadingSkeleton({ className = '' }) {
  return <div className={cn('animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700', className)} />;
}

export default LoadingSkeleton;
