import { AlertTriangle, CalendarDays, ClipboardList, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../ui/Button';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';

const kpiConfig = {
  pending: { Icon: ClipboardList, style: 'bg-info/10 text-info' },
  overdue: { Icon: AlertTriangle, style: 'bg-danger/10 text-danger' },
  today: { Icon: CalendarDays, style: 'bg-warning/10 text-warning' }
};

function MiniKpiCard({ kpiKey, label, value }) {
  const config = kpiConfig[kpiKey];

  return (
    <div className="flex min-h-[104px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl bg-surface-secondary p-3 text-center">
      <config.Icon className={`h-5 w-5 ${config.style.split(' ')[1]}`} aria-hidden="true" />
      <span className="block text-2xl font-bold leading-none tabular-nums text-content-primary">{value}</span>
      <span className="text-[11px] font-medium text-content-muted">{label}</span>
    </div>
  );
}

function FinancialTasksWidget({ data }) {
  const navigate = useNavigate();

  if (!data) return null;

  const pending = data.pending ?? data.pendingTasks ?? 0;
  const overdue = data.overdue ?? data.overdueTasks ?? 0;
  const today = data.today ?? data.todayTasks ?? 0;
  const taskStatus = overdue > 0 ? 'critical' : today > 0 ? 'attention' : 'healthy';
  const statusLabel = overdue > 0 ? 'Atrasadas' : today > 0 ? 'Hoje' : 'Em dia';

  return (
    <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-info/25 hover:shadow-floating sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-info/10 text-info">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-content-primary">Tarefas financeiras</h3>
            <p className="mt-0.5 text-xs text-content-muted">Resumo de pendências</p>
          </div>
        </div>
        <StatusBadge status={taskStatus} label={statusLabel} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <MiniKpiCard kpiKey="pending" label="Pendentes" value={pending} />
        <MiniKpiCard kpiKey="overdue" label="Atrasadas" value={overdue} />
        <MiniKpiCard kpiKey="today" label="Hoje" value={today} />
      </div>

      <Button variant="secondary" size="sm" className="mt-5 w-full" onClick={() => navigate('/financial-tasks')}>
        <ExternalLink className="h-4 w-4" />
        Ver todas
      </Button>
    </Card>
  );
}

export default FinancialTasksWidget;
