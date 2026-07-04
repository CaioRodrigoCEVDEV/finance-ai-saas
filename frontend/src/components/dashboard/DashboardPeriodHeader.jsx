import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import DashboardPeriodSheet from './DashboardPeriodSheet';
import { buildAvailablePeriodOptions, formatDashboardPeriodLabel, getDashboardPeriodKey, parseDashboardPeriodValue } from '../../utils/dashboardPeriod';

function DashboardPeriodHeader({ period, loading, availablePeriods, onPrevious, onNext, onToday, onSelectPeriod }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const options = buildAvailablePeriodOptions(availablePeriods);
  const periodKey = getDashboardPeriodKey(period);
  const isToday = periodKey === getDashboardPeriodKey();
  const periodLabel = formatDashboardPeriodLabel(period.month, period.year);

  return (
    <Card className="rounded-[28px] !border-slate-200/80 !bg-white/90 p-6 shadow-soft backdrop-blur transition-colors dark:!border-slate-700/80 dark:!bg-slate-800/90">
      <div className="lg:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard Financeiro
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Resumo do período
          </p>
        </div>

        <div className={`mt-5 flex flex-col items-center gap-2 ${loading ? 'pointer-events-none opacity-75' : ''}`}>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
            Período
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Mês anterior"
              disabled={loading}
              onClick={onPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 rounded-2xl px-5 py-2 text-base font-semibold text-slate-900 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700/50"
              aria-label="Selecionar período"
            >
              {periodLabel}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            <button
              type="button"
              aria-label="Próximo mês"
              disabled={loading}
              onClick={onNext}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            disabled={loading || isToday}
            onClick={onToday}
            className="rounded-full px-4 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-default disabled:text-slate-400 dark:text-emerald-400 dark:hover:bg-emerald-900/20 dark:disabled:text-slate-600"
          >
            Hoje
          </button>
        </div>
      </div>

      <div className={`hidden lg:flex lg:flex-row lg:items-end lg:justify-between ${loading ? 'pointer-events-none opacity-75' : ''}`} aria-busy={loading}>
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

        <div className={`flex flex-col gap-3 ${loading ? 'pointer-events-none opacity-75' : ''}`}>
          <div className="flex flex-nowrap items-end gap-3 lg:flex-wrap">
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
              className="min-w-0 flex-1 lg:min-w-[260px]"
              label="Período"
              onChange={(event) => {
                const nextPeriod = parseDashboardPeriodValue(event.target.value);
                if (nextPeriod) onSelectPeriod(nextPeriod);
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

          <div className="flex justify-center lg:justify-end">
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

      {sheetOpen ? (
        <DashboardPeriodSheet
          period={period}
          availablePeriods={availablePeriods}
          onSelect={onSelectPeriod}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </Card>
  );
}

export default DashboardPeriodHeader;
