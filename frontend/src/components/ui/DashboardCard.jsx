import { useCallback, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import Card from './Card';

const STORAGE_PREFIX = 'dashboard-card-state_';

function readCollapseState(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return null;
    return raw === 'true';
  } catch {
    return null;
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
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    borderGlow: 'hover:border-primary/25'
  },
  blue: {
    iconBg: 'bg-info/10',
    iconText: 'text-info',
    borderGlow: 'hover:border-info/25'
  },
  rose: {
    iconBg: 'bg-danger/10',
    iconText: 'text-danger',
    borderGlow: 'hover:border-danger/25'
  },
  amber: {
    iconBg: 'bg-warning/10',
    iconText: 'text-warning',
    borderGlow: 'hover:border-warning/25'
  },
  sky: {
    iconBg: 'bg-info/10',
    iconText: 'text-info',
    borderGlow: 'hover:border-info/25'
  },
  indigo: {
    iconBg: 'bg-accent-purple/10',
    iconText: 'text-accent-purple',
    borderGlow: 'hover:border-accent-purple/25'
  },
  slate: {
    iconBg: 'bg-surface-secondary',
    iconText: 'text-content-secondary',
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
  const contentId = useId();

  const [collapsed, setCollapsed] = useState(() => {
    if (!collapseKey) return defaultCollapsed;
    return readCollapseState(collapseKey) ?? defaultCollapsed;
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
        'bg-surface p-5 transition-all duration-200 ease-out sm:p-6',
        'hover:-translate-y-0.5 hover:shadow-floating',
        config.borderGlow,
        'group',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            config.iconBg
          )}>
            <Icon className={cn('h-5 w-5', config.iconText)} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-content-primary">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs text-content-muted">{description}</p>
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
                'flex h-9 w-9 items-center justify-center rounded-full border',
                'border-border-soft bg-surface-secondary text-content-muted',
                'hover:bg-surface-hover hover:text-content-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                'transition-all duration-200'
              )}
              aria-label={collapsed ? 'Expandir' : 'Recolher'}
              aria-controls={contentId}
              aria-expanded={!collapsed}
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
        id={contentId}
        className="grid transition-[grid-template-rows] duration-[250ms] ease-in-out"
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
