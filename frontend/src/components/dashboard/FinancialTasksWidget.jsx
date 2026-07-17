import { CheckSquare, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';

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
    <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6
      dark:from-slate-800 dark:to-slate-800/80
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:scale-[1.01]
      hover:shadow-glow dark:hover:shadow-glow-dark hover:border-sky-200
      dark:hover:border-sky-800
      group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-900/40 transition-shadow duration-300 group-hover:shadow-md">
            <CheckSquare className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Tarefas Financeiras</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Resumo de pendências</p>
          </div>
        </div>
        <StatusBadge status={taskStatus} label={statusLabel} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-center dark:border-slate-700/50 dark:bg-slate-800/30">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pendentes</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{pending}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3 text-center dark:border-rose-900/30 dark:bg-rose-900/10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 dark:text-rose-500">Atrasadas</p>
          <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{overdue}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3 text-center dark:border-amber-900/30 dark:bg-amber-900/10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 dark:text-amber-500">Hoje</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{today}</p>
        </div>
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
