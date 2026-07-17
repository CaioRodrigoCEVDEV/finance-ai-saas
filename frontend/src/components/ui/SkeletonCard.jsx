import { cn } from '../../utils/cn';

function SkeletonCard({ className = '', lines = 3, height = 'h-56' }) {
  return (
    <div className={cn(
      'rounded-[28px] border border-slate-200/50 bg-white p-6 dark:border-slate-700/50 dark:bg-slate-800',
      height,
      className
    )}>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-20 rounded-lg bg-slate-200/60 dark:bg-slate-700/60" />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-8 w-36 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-48 rounded-lg bg-slate-200/60 dark:bg-slate-700/60" />
        </div>
        {lines > 0 && (
          <div className="mt-4 space-y-2.5">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 rounded-lg bg-slate-200/60 dark:bg-slate-700/60" style={{ width: `${50 + Math.random() * 30}%` }} />
                <div className="h-3 w-16 rounded-lg bg-slate-200/60 dark:bg-slate-700/60" />
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
