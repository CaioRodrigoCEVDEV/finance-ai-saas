import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '../../utils/cn';

function getOptionLabel(children) {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  return Children.toArray(children).map((child) => (typeof child === 'string' || typeof child === 'number' ? child : '')).join('');
}

function getOptions(children) {
  return Children.toArray(children)
    .filter(isValidElement)
    .flatMap((child) => {
      if (child.type === 'optgroup') {
        return getOptions(child.props.children);
      }

      if (child.type !== 'option') return [];

      const optionValue = child.props.value ?? getOptionLabel(child.props.children);

      return [{
        value: String(optionValue),
        label: getOptionLabel(child.props.children),
        disabled: Boolean(child.props.disabled)
      }];
    });
}

function Select({
  label,
  error,
  className = '',
  children,
  value,
  defaultValue,
  name,
  onChange,
  disabled = false,
  id,
  placeholder = 'Selecione',
  'aria-label': ariaLabel,
  ...props
}) {
  const generatedId = useId();
  const buttonId = id || `${generatedId}-select`;
  const listboxId = `${buttonId}-listbox`;
  const errorId = error ? `${buttonId}-error` : undefined;
  const options = useMemo(() => getOptions(children), [children]);
  const [internalValue, setInternalValue] = useState(defaultValue === undefined ? undefined : String(defaultValue));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState({});
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const selectedValue = value === undefined ? (internalValue ?? String(options[0]?.value ?? '')) : String(value ?? '');
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const displayValue = selectedOption?.label || placeholder;
  const hasSelection = Boolean(selectedOption);

  useEffect(() => {
    if (!open) return undefined;

    const nextIndex = selectedIndex >= 0 ? selectedIndex : options.findIndex((option) => !option.disabled);
    setActiveIndex(nextIndex >= 0 ? nextIndex : 0);

    function updateMenuPosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const gap = 8;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const availableBelow = viewportHeight - rect.bottom - gap;
      const availableAbove = rect.top - gap;
      const openAbove = availableBelow < 180 && availableAbove > availableBelow;
      const maxHeight = Math.max(120, Math.min(256, openAbove ? availableAbove - gap : availableBelow - gap));
      const width = Math.min(rect.width, viewportWidth - gap * 2);
      const left = Math.min(Math.max(gap, rect.left), viewportWidth - width - gap);
      const top = openAbove ? Math.max(gap, rect.top - maxHeight - gap) : rect.bottom + gap;

      setMenuStyle({
        left,
        maxHeight,
        top,
        width
      });
    }

    updateMenuPosition();

    function handlePointerDown(event) {
      if (rootRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, options, selectedIndex]);

  useEffect(() => {
    if (!open) return;

    const activeOption = document.getElementById(`${listboxId}-option-${activeIndex}`);
    activeOption?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listboxId, open]);

  function findNextEnabledIndex(startIndex, direction) {
    if (!options.length) return -1;

    let nextIndex = startIndex;
    for (let step = 0; step < options.length; step += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex]?.disabled) return nextIndex;
    }

    return -1;
  }

  function selectOption(option) {
    if (!option || option.disabled || disabled) return;

    if (value === undefined) setInternalValue(option.value);
    setOpen(false);

    onChange?.({
      target: { name, value: option.value },
      currentTarget: { name, value: option.value }
    });
  }

  function handleKeyDown(event) {
    if (disabled) return;

    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;

      if (!open) {
        setOpen(true);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : findNextEnabledIndex(direction === 1 ? -1 : 0, direction));
        return;
      }

      const nextIndex = findNextEnabledIndex(activeIndex, direction);
      if (nextIndex >= 0) setActiveIndex(nextIndex);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }

      selectOption(options[activeIndex]);
    }
  }

  return (
    <label
      ref={rootRef}
      className="relative block min-w-0"
      data-error={error ? 'true' : undefined}
      onBlur={(event) => {
        if (rootRef.current?.contains(event.relatedTarget)) return;
        if (menuRef.current?.contains(event.relatedTarget)) return;
        setOpen(false);
      }}
    >
      {label ? <span className="mb-2 block text-sm font-medium text-content-secondary">{label}</span> : null}
      <span className="relative block">
        <select
          aria-hidden="true"
          aria-label={ariaLabel}
          className="hidden"
          disabled={disabled}
          id={`${buttonId}-native`}
          name={name}
          onChange={() => {}}
          tabIndex={-1}
          value={selectedValue}
          {...props}
        >
          {children}
        </select>
        <button
          aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
          aria-label={ariaLabel || label}
          aria-controls={listboxId}
          aria-describedby={errorId}
          aria-disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'flex w-full min-w-0 items-center justify-between gap-3 rounded-[14px] border bg-surface px-4 py-3 pr-10 text-left !text-base text-content-primary outline-none transition focus:ring-4 sm:!text-sm',
            'disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-content-muted disabled:opacity-70',
            error ? 'border-danger/50 focus:border-danger focus:ring-danger/10' : 'border-border-ui hover:border-primary/40 focus:border-primary focus:ring-primary/10',
            open && !error ? 'border-primary ring-4 ring-primary/10' : '',
            className
          )}
          disabled={disabled}
          id={buttonId}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleKeyDown}
          ref={buttonRef}
          role="combobox"
          type="button"
        >
          <span className={cn('block min-w-0 flex-1 truncate', hasSelection ? 'text-content-primary' : 'text-content-muted')}>
            {displayValue}
          </span>
        </button>
        <ChevronDown className={cn('pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted transition', open ? 'rotate-180 text-primary' : '')} />
      </span>

      {open ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 min-w-0 overflow-y-auto overflow-x-hidden rounded-[14px] border border-border-ui bg-surface p-1.5 shadow-floating"
          id={listboxId}
          role="listbox"
          style={menuStyle}
        >
          {options.map((option, index) => {
            const selected = option.value === selectedValue;
            const active = index === activeIndex;

            return (
              <button
                aria-disabled={option.disabled}
                aria-selected={selected}
                className={cn(
                  'flex w-full min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
                  selected ? 'bg-primary/10 text-primary' : 'text-content-secondary',
                  active && !option.disabled ? 'bg-primary/10 text-primary' : '',
                  option.disabled ? 'cursor-not-allowed text-content-muted opacity-60' : 'hover:bg-primary/10 hover:text-primary'
                )}
                disabled={option.disabled}
                id={`${listboxId}-option-${index}`}
                key={`${option.value}-${option.label}`}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                tabIndex={-1}
                type="button"
              >
                <span className="min-w-0 flex-1 break-words">{option.label}</span>
                {selected ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
              </button>
            );
          })}
        </div>,
        document.body
      ) : null}
      {error ? <span id={errorId} className="mt-2 block text-sm text-danger">{error}</span> : null}
    </label>
  );
}

export default Select;
