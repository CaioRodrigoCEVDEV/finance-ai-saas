import { ChevronLeft, ChevronRight, CircleDot } from 'lucide-react';

import Button from '../ui/Button';
import Select from '../ui/Select';
import { buildAvailablePeriodOptions, formatDashboardPeriodLabel, getDashboardPeriodKey, parseDashboardPeriodValue } from '../../utils/dashboardPeriod';

function DashboardPeriodHeader({ period, loading, availablePeriods, onPrevious, onNext, onToday, onSelectPeriod }) {
  const options = buildAvailablePeriodOptions(availablePeriods);
  const periodKey = getDashboardPeriodKey(period);
  const isToday = periodKey === getDashboardPeriodKey();
  const periodLabel = formatDashboardPeriodLabel(period.month, period.year);

  return (
    <header className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between" aria-busy={loading}>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">FinanceAI</p>
        <h1 className="mt-1 text-xl font-bold tracking-[-0.03em] text-content-primary sm:text-2xl">Visão geral financeira</h1>
        <p className="mt-1 text-sm text-content-secondary">Acompanhe seu mês com dados atualizados.</p>
      </div>

      <div className={`flex flex-col items-stretch gap-2 sm:items-end ${loading ? 'pointer-events-none opacity-70' : ''}`}>
        <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-end gap-2 sm:min-w-[310px]">
          <Button
            aria-label="Mês anterior"
            className="h-10 w-10 rounded-full px-0"
            disabled={loading}
            onClick={onPrevious}
            variant="secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select
            className="h-10 !py-0"
            aria-label="Período do dashboard"
            onChange={(event) => {
              const nextPeriod = parseDashboardPeriodValue(event.target.value);
              if (nextPeriod) onSelectPeriod(nextPeriod);
            }}
            value={periodKey}
            disabled={loading}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <Button
            aria-label="Próximo mês"
            className="h-10 w-10 rounded-full px-0"
            disabled={loading}
            onClick={onNext}
            variant="secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={loading || isToday}
            onClick={onToday}
            className="text-xs font-semibold text-primary transition hover:text-primary-hover disabled:cursor-default disabled:text-content-muted"
          >
            Ir para hoje
          </button>
          <span className="flex items-center gap-1.5 text-xs text-content-muted">
            <CircleDot className="h-3 w-3 text-primary" />
            {loading ? 'Atualizando...' : periodLabel}
          </span>
        </div>
      </div>
    </header>
  );
}

export default DashboardPeriodHeader;
