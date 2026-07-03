import { ChevronLeft, ChevronRight } from 'lucide-react';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { buildDashboardPeriodOptions, formatDashboardPeriodLabel, getDashboardPeriodKey, parseDashboardPeriodValue } from '../../utils/dashboardPeriod';

function DashboardPeriodHeader({ period, loading, onPrevious, onNext, onToday, onSelectPeriod }) {
  const options = buildDashboardPeriodOptions(period);
  const periodKey = getDashboardPeriodKey(period);
  const isToday = periodKey === getDashboardPeriodKey();
  const periodLabel = formatDashboardPeriodLabel(period.month, period.year);

  return (
    <Card className="rounded-[28px] !border-slate-200/80 !bg-white/90 p-6 shadow-soft backdrop-blur transition-colors dark:!border-slate-700/80 dark:!bg-slate-800/90">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
            Finance AI
          </p>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Dashboard Financeiro
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Resumo do período selecionado.
            </p>
          </div>
        </div>

        <div className={`flex flex-col gap-3 ${loading ? 'pointer-events-none opacity-75' : ''}`} aria-busy={loading}>
          <div className="flex flex-wrap items-end gap-3">
            <Button
              aria-label="Mês anterior"
              className="!h-11 !w-11 shrink-0 !px-0"
              disabled={loading}
              onClick={onPrevious}
              variant="secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select
              className="min-w-[220px] sm:min-w-[260px]"
              label="Período"
              onChange={(event) => {
                const nextPeriod = parseDashboardPeriodValue(event.target.value);

                if (nextPeriod) {
                  onSelectPeriod(nextPeriod);
                }
              }}
              value={periodKey}
              disabled={loading}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Button
              aria-label="Próximo mês"
              className="!h-11 !w-11 shrink-0 !px-0"
              disabled={loading}
              onClick={onNext}
              variant="secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              disabled={loading || isToday}
              onClick={onToday}
              variant="ghost"
              size="sm"
            >
              Hoje
            </Button>
          </div>
        </div>
      </div>
      <p className="sr-only">Período atual selecionado: {periodLabel}</p>
    </Card>
  );
}

export default DashboardPeriodHeader;
