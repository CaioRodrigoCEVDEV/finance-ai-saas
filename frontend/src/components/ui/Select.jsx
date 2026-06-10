import { ChevronDown } from 'lucide-react';

import { cn } from '../../utils/cn';

function Select({ label, error, className = '', children, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span> : null}
      <span className="relative block">
        <select
          className={cn(
            'w-full appearance-none rounded-2xl border bg-white px-4 py-3 pr-10 text-slate-900 outline-none transition focus:ring-4',
            error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
      {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
    </label>
  );
}

export default Select;
