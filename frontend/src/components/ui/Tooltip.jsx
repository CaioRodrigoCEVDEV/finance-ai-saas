import { useState } from 'react';
import { cn } from '../../utils/cn';

function Tooltip({ children, content, className = '' }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <span
        tabIndex={0}
        role="button"
        aria-describedby={show ? 'tooltip' : undefined}
        className="cursor-default"
      >
        {children}
      </span>
      {show && content && (
        <span
          id="tooltip"
          role="tooltip"
          className={cn(
            'absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap',
            'rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-lg',
            'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
            'pointer-events-none animate-fade-in',
            className
          )}
        >
          {content}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-200 dark:border-t-slate-600" />
        </span>
      )}
    </span>
  );
}

export default Tooltip;
