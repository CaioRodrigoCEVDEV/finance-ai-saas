import { CheckSquare, ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatDateBR } from '../../utils/formatters';

const priorityColors = {
  LOW: 'bg-emerald-500',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-rose-500'
};

function FinancialTasksWidget({ data }) {
  const navigate = useNavigate();

  if (!data) return null;

  const pending = data.pending ?? data.pendingTasks ?? 0;
  const overdue = data.overdue ?? data.overdueTasks ?? 0;
  const today = data.today ?? data.todayTasks ?? 0;
  const completed = data.completed ?? data.completedTasks ?? 0;
  const nextTasks = data.nextTasks ?? [];

  return (
    <Card className="rounded-[28px] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
          <CheckSquare className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Tarefas Financeiras</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Pendentes</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{pending}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Atrasadas</p>
          <p className="mt-1 text-2xl font-semibold text-rose-600 dark:text-rose-400">{overdue}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Hoje</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">{today}</p>
        </div>
      </div>

      {nextTasks && nextTasks.length > 0 ? (
        <div className="mt-5 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Proximas</p>
          {nextTasks.slice(0, 3).map((task) => {
            const dotColor = priorityColors[task.priority] || priorityColors.MEDIUM;
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

            return (
              <div key={task.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/50">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                    {isOverdue ? <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" /> : null}
                  </div>
                  {task.dueDate ? (
                    <p className={`text-xs ${isOverdue ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      {isOverdue ? 'Atrasada — ' : ''}Vence {formatDateBR(task.dueDate)}
                    </p>
                  ) : null}
                  {task.totalItems > 0 ? (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{task.progress}%</span>
                    </div>
                  ) : null}
                  {task.estimatedAmount ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {Number(task.estimatedAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4">
        <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('/financial-tasks')}>
          <ExternalLink className="h-4 w-4" />
          Ver todas
        </Button>
      </div>
    </Card>
  );
}

export default FinancialTasksWidget;
