import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import Card from './Card';

const STORAGE_PREFIX = 'dashboard-card-state_';

function readCollapseState(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw === 'true';
  } catch {
    return false;
  }
}

function writeCollapseState(key, collapsed) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, String(collapsed));
  } catch {
    // ignore
  }
}

const colorConfig = {
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.08)]',
    borderGlow: 'hover:border-emerald-200 dark:hover:border-emerald-800'
  },
  blue: {
    iconBg: 'bg-blue-50 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.08)]',
    borderGlow: 'hover:border-blue-200 dark:hover:border-blue-800'
  },
  rose: {
    iconBg: 'bg-rose-50 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-400',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.08)]',
    borderGlow: 'hover:border-rose-200 dark:hover:border-rose-800'
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)]',
    borderGlow: 'hover:border-amber-200 dark:hover:border-amber-800'
  },
  sky: {
    iconBg: 'bg-sky-50 dark:bg-sky-900/40',
    iconText: 'text-sky-600 dark:text-sky-400',
    glow: 'shadow-[0_0_20px_rgba(14,165,233,0.08)]',
    borderGlow: 'hover:border-sky-200 dark:hover:border-sky-800'
  },
  indigo: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/40',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.08)]',
    borderGlow: 'hover:border-indigo-200 dark:hover:border-indigo-800'
  },
  slate: {
    iconBg: 'bg-slate-100 dark:bg-slate-700/50',
    iconText: 'text-slate-600 dark:text-slate-400',
    glow: '',
    borderGlow: ''
  }
};

function DashboardCard({
  icon: Icon,
  title,
  description,
  color = 'slate',
  children,
  className = '',
  headerRight,
  collapseKey,
  defaultCollapsed = false,
  ...props
}) {
  const config = colorConfig[color] || colorConfig.slate;

  const [collapsed, setCollapsed] = useState(() => {
    if (!collapseKey) return defaultCollapsed;
    return readCollapseState(collapseKey);
  });

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      if (collapseKey) writeCollapseState(collapseKey, next);
      return next;
    });
  }, [collapseKey]);

  return (
    <Card
      className={cn(
        'rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6',
        'dark:from-slate-800 dark:to-slate-800/80',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:scale-[1.01]',
        'hover:shadow-glow dark:hover:shadow-glow-dark',
        config.borderGlow,
        'group',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className={cn(
            'relative flex h-11 w-11 items-center justify-center rounded-2xl',
            config.iconBg,
            'transition-shadow duration-300',
            'group-hover:shadow-md'
          )}>
            <Icon className={cn('h-5 w-5', config.iconText)} aria-hidden="true" />
            <div className={cn(
              'absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-300',
              config.iconBg,
              'group-hover:opacity-40'
            )} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {headerRight && <div>{headerRight}</div>}
          {collapseKey && (
            <button
              type="button"
              onClick={toggle}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border',
                'border-slate-200 bg-white/80 text-slate-500',
                'hover:border-slate-300 hover:bg-white hover:text-slate-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1',
                'dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-400',
                'dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                'transition-all duration-200'
              )}
              aria-label={collapsed ? 'Expandir' : 'Recolher'}
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  collapsed && '-rotate-90'
                )}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-250 ease-in-out"
        style={{ gridTemplateRows: collapsed ? '0fr' : '1fr' }}
      >
        <div className="overflow-hidden">
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </Card>
  );
}

export default DashboardCard;
