import { ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, CalendarDays, CircleDot } from 'lucide-react';
import { useState } from 'react';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import DashboardPeriodSheet from './DashboardPeriodSheet';
import { buildAvailablePeriodOptions, formatDashboardPeriodLabel, getDashboardPeriodKey, parseDashboardPeriodValue } from '../../utils/dashboardPeriod';

function UpdatedNowIndicator() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
      <CircleDot className="h-3 w-3 text-emerald-500" aria-hidden="true" />
      <span>Atualizado agora</span>
    </div>
  );
}

function DashboardPeriodHeader({ period, loading, availablePeriods, onPrevious, onNext, onToday, onSelectPeriod }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const options = buildAvailablePeriodOptions(availablePeriods);
  const periodKey = getDashboardPeriodKey(period);
  const isToday = periodKey === getDashboardPeriodKey();
  const periodLabel = formatDashboardPeriodLabel(period.month, period.year);

  return (
    <Card className="rounded-[28px] !border-slate-200/80 !bg-gradient-to-br !from-white !to-slate-50/80 p-6 shadow-soft backdrop-blur transition-colors dark:!border-slate-700/80 dark:!from-slate-800 dark:!to-slate-800/95 sm:p-8">
      <div className="lg:hidden">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard Financeiro
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Resumo completo da sua situação financeira para o período selecionado.
            </p>
          </div>
        </div>

        <div className={`mt-5 flex flex-col items-center gap-2 ${loading ? 'pointer-events-none opacity-75' : ''}`}>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
              Período
            </span>
          </div>

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

          <UpdatedNowIndicator />
        </div>
      </div>

      <div className={`hidden lg:flex lg:flex-row lg:items-end lg:justify-between ${loading ? 'pointer-events-none opacity-75' : ''}`} aria-busy={loading}>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
            Finance AI
          </p>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-8 w-1 rounded-full bg-emerald-500" aria-hidden="true" />
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                <LayoutDashboard className="h-7 w-7 text-emerald-500 sm:h-8 sm:w-8" aria-hidden="true" />
                Dashboard Financeiro
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                Resumo completo da sua situação financeira para o período selecionado.
              </p>
            </div>
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

          <div className="flex items-center justify-between">
            <Button
              disabled={loading || isToday}
              onClick={onToday}
              variant="ghost"
              size="sm"
            >
              Hoje
            </Button>
            <UpdatedNowIndicator />
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
