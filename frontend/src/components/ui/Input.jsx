import { cn } from '../../utils/cn';

function Input({ label, error, className = '', id, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span> : null}
      <input
        id={id}
        className={cn(
          'w-full rounded-2xl border bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
          error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-600 dark:focus:border-rose-500 dark:focus:ring-rose-900/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 dark:border-slate-600 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30',
          className
        )}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
    </label>
  );
}

export default Input;
