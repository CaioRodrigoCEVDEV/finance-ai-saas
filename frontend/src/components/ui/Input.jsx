import { useId } from 'react';

import { cn } from '../../utils/cn';

function Input({ label, error, className = '', id, 'aria-describedby': ariaDescribedBy, ...props }) {
  const generatedId = useId();
  const inputId = id || `${generatedId}-input`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <label className="block" data-error={error ? 'true' : undefined}>
      {label ? <span className="mb-2 block text-sm font-medium text-content-secondary">{label}</span> : null}
      <input
        id={inputId}
        aria-describedby={ariaDescribedBy || errorId}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full rounded-[14px] border bg-surface px-4 py-3 !text-base text-content-primary outline-none transition placeholder:text-content-muted focus:ring-4 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-content-muted sm:!text-sm',
          error ? 'border-danger/50 focus:border-danger focus:ring-danger/10' : 'border-border-ui hover:border-primary/40 focus:border-primary focus:ring-primary/10',
          className
        )}
        {...props}
      />
      {error ? <span id={errorId} className="mt-2 block text-sm text-danger">{error}</span> : null}
    </label>
  );
}

export default Input;
