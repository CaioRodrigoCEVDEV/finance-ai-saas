import { cloneElement, isValidElement, useId, useState } from 'react';

import { cn } from '../../utils/cn';

function Tooltip({ children, content, className = '' }) {
  const [show, setShow] = useState(false);
  const tooltipId = useId();

  const trigger = isValidElement(children) ? cloneElement(children, {
    'aria-describedby': show ? tooltipId : children.props['aria-describedby'],
    onMouseEnter: (event) => {
      children.props.onMouseEnter?.(event);
      setShow(true);
    },
    onMouseLeave: (event) => {
      children.props.onMouseLeave?.(event);
      setShow(false);
    },
    onFocus: (event) => {
      children.props.onFocus?.(event);
      setShow(true);
    },
    onBlur: (event) => {
      children.props.onBlur?.(event);
      setShow(false);
    },
    onKeyDown: (event) => {
      children.props.onKeyDown?.(event);
      if (event.key === 'Escape') setShow(false);
    },
    tabIndex: children.props.tabIndex ?? (typeof children.type === 'string' && ['div', 'span'].includes(children.type) ? 0 : undefined)
  }) : children;

  return (
    <span className="relative inline-flex">
      {trigger}
      {show && content ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 max-w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2',
            'rounded-xl border border-border-ui bg-surface px-3 py-1.5 text-center text-xs font-medium text-content-secondary shadow-floating',
            'animate-fade-in whitespace-normal',
            className
          )}
        >
          {content}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border-ui" />
        </span>
      ) : null}
    </span>
  );
}

export default Tooltip;
