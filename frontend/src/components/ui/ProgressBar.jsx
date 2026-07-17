import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

const colorMap = {
  emerald: 'from-emerald-400 to-emerald-600',
  blue: 'from-blue-400 to-blue-600',
  rose: 'from-rose-400 to-rose-600',
  amber: 'from-amber-400 to-amber-600',
  sky: 'from-sky-400 to-sky-600',
  indigo: 'from-indigo-400 to-indigo-600',
  slate: 'from-slate-400 to-slate-600'
};

const solidColorMap = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
  indigo: 'bg-indigo-500',
  slate: 'bg-slate-400'
};

function ProgressBar({ value = 0, color = 'emerald', height = 'h-2', animate = true, showShine = true }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(Math.min(value, 100)), 50);
      return () => clearTimeout(timer);
    }
    setWidth(Math.min(value, 100));
  }, [value, animate]);

  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50', height)}>
      <div
        ref={ref}
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out',
          solidColorMap[color] || solidColorMap.slate
        )}
        style={{ width: `${width}%` }}
      >
        {showShine && width > 0 && (
          <div
            className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export default ProgressBar;
