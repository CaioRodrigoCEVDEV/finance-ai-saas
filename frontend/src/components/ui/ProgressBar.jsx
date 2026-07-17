import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

const solidColorMap = {
  emerald: 'bg-emerald-500 dark:bg-emerald-400',
  blue: 'bg-blue-500 dark:bg-blue-400',
  rose: 'bg-rose-500 dark:bg-rose-400',
  amber: 'bg-amber-500 dark:bg-amber-400',
  sky: 'bg-sky-500 dark:bg-sky-400',
  indigo: 'bg-indigo-500 dark:bg-indigo-400',
  slate: 'bg-slate-400 dark:bg-slate-500'
};

const glowColorMap = {
  emerald: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
  blue: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]',
  rose: 'shadow-[0_0_8px_rgba(244,63,94,0.4)]',
  amber: 'shadow-[0_0_8px_rgba(245,158,11,0.4)]',
  sky: 'shadow-[0_0_8px_rgba(14,165,233,0.4)]',
  indigo: 'shadow-[0_0_8px_rgba(99,102,241,0.4)]',
  slate: ''
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
          solidColorMap[color] || solidColorMap.slate,
          width > 0 && glowColorMap[color]
        )}
        style={{ width: `${width}%` }}
      >
        {showShine && width > 0 && (
          <div
            className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent dark:via-white/15"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export default ProgressBar;
