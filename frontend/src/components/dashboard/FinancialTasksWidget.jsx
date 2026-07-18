import { ClipboardList, AlertTriangle, CalendarDays, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';

const kpiConfig = {
  pending: {
    Icon: ClipboardList,
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200/60 dark:border-blue-500/20',
    icon: 'text-blue-500 dark:text-blue-400',
    value: 'text-blue-600 dark:text-blue-400',
    label: 'text-blue-500/75 dark:text-blue-400/75',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-500/40',
    hoverShadow: 'hover:shadow-[0_8px_24px_-4px_rgba(59,130,246,0.18)] dark:hover:shadow-[0_8px_24px_-4px_rgba(59,130,246,0.12)]',
  },
  overdue: {
    Icon: AlertTriangle,
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200/60 dark:border-rose-500/20',
    icon: 'text-rose-500 dark:text-rose-400',
    value: 'text-rose-600 dark:text-rose-400',
    label: 'text-rose-500/75 dark:text-rose-400/75',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-500/40',
    hoverShadow: 'hover:shadow-[0_8px_24px_-4px_rgba(244,63,94,0.18)] dark:hover:shadow-[0_8px_24px_-4px_rgba(244,63,94,0.12)]',
  },
  today: {
    Icon: CalendarDays,
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200/60 dark:border-amber-500/20',
    icon: 'text-amber-500 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
    label: 'text-amber-500/75 dark:text-amber-400/75',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-500/40',
    hoverShadow: 'hover:shadow-[0_8px_24px_-4px_rgba(245,158,11,0.18)] dark:hover:shadow-[0_8px_24px_-4px_rgba(245,158,11,0.12)]',
  },
};

function MiniKpiCard({ kpiKey, label, value }) {
  const { Icon, bg, border, icon, value: valueCls, label: labelCls, hoverBorder, hoverShadow } = kpiConfig[kpiKey];

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center
        transition-all duration-200 ease-out
        hover:-translate-y-0.5
        ${bg} ${border} ${hoverBorder} ${hoverShadow}`}
      style={{ minHeight: '110px' }}
    >
      <Icon className={`h-7 w-7 ${icon}`} strokeWidth={1.75} aria-hidden="true" />
      <span className={`block text-[34px] font-bold leading-none tabular-nums ${valueCls}`}>
        {value}
      </span>
      <span className={`text-xs font-medium ${labelCls}`}>
        {label}
      </span>
    </div>
  );
}

function FinancialTasksWidget({ data }) {
  const navigate = useNavigate();

  if (!data) return null;

  const pending = data.pending ?? data.pendingTasks ?? 0;
  const overdue = data.overdue ?? data.overdueTasks ?? 0;
  const today = data.today ?? data.todayTasks ?? 0;

  const hasUrgent = overdue > 0;
  const taskStatus = hasUrgent ? 'critical' : today > 0 ? 'attention' : 'healthy';
  const statusLabel = hasUrgent ? 'Atrasadas' : today > 0 ? 'Hoje' : 'Em dia';

  return (
    <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-5
      dark:from-slate-800 dark:to-slate-800/80
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:scale-[1.01]
      hover:shadow-glow dark:hover:shadow-glow-dark hover:border-sky-200
      dark:hover:border-sky-800
      group sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-900/40 transition-shadow duration-300 group-hover:shadow-md">
            <ClipboardList className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Tarefas Financeiras</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Resumo de pendências</p>
          </div>
        </div>
        <StatusBadge status={taskStatus} label={statusLabel} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniKpiCard kpiKey="pending" label="Pendentes" value={pending} />
        <MiniKpiCard kpiKey="overdue" label="Atrasadas" value={overdue} />
        <MiniKpiCard kpiKey="today" label="Hoje" value={today} />
      </div>

      <div className="mt-5">
        <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('/financial-tasks')}>
          <ExternalLink className="h-4 w-4" />
          Ver todas
        </Button>
      </div>
    </Card>
  );
}

export default FinancialTasksWidget;
