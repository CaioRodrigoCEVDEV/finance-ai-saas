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
  ...props
}) {
  const generatedId = useId();
  const buttonId = id || `${generatedId}-select`;
  const listboxId = `${buttonId}-listbox`;
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
      onBlur={(event) => {
        if (rootRef.current?.contains(event.relatedTarget)) return;
        if (menuRef.current?.contains(event.relatedTarget)) return;
        setOpen(false);
      }}
    >
      {label ? <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span> : null}
      <span className="relative block">
        <select
          aria-hidden="true"
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
          aria-controls={listboxId}
          aria-disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            'flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 pr-10 text-left text-slate-900 outline-none transition focus:ring-4 dark:bg-slate-800/80 dark:text-slate-100',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-70 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-500',
            error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-600 dark:focus:border-rose-500 dark:focus:ring-rose-900/30' : 'border-slate-300 hover:border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100 dark:border-slate-600 dark:hover:border-emerald-500/70 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30',
            open && !error ? 'border-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900/30' : '',
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
          <span className={cn('block min-w-0 flex-1 truncate', hasSelection ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-400')}>
            {displayValue}
          </span>
        </button>
        <ChevronDown className={cn('pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition text-slate-400 dark:text-slate-500', open ? 'rotate-180 text-emerald-500 dark:text-emerald-400' : '')} />
      </span>

      {open ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 min-w-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 dark:ring-white/10"
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
                  selected ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100' : 'text-slate-700 dark:text-slate-200',
                  active && !option.disabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100' : '',
                  option.disabled ? 'cursor-not-allowed text-slate-400 opacity-60 dark:text-slate-600' : 'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-100'
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
                {selected ? <Check className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-300" /> : null}
              </button>
            );
          })}
        </div>,
        document.body
      ) : null}
      {error ? <span className="mt-2 block text-sm text-rose-600">{error}</span> : null}
    </label>
  );
}

export default Select;
