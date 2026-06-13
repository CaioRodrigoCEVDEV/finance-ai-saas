import { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AppLayout from '../layouts/AppLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import MetricCard from '../components/MetricCard';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Select from '../components/ui/Select';
import { usePrivacy } from '../contexts/PrivacyContext';
import { formatDateBR } from '../utils/formatters';
import { getFinancialCalendarMonth } from '../services/financialCalendarService';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'EXPENSE', label: 'Despesas' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'RECURRENCE_PREVIEW', label: 'Previsões' }
];

function getMonthName(year, month) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1)
  );
}

function getDayName(dateStr) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(dateStr + 'T12:00:00'));
}

function getStatusVariant(status) {
  if (status === 'PAID') return 'success';
  if (status === 'PENDING') return 'warning';
  return 'neutral';
}

function getStatusLabel(status) {
  if (status === 'PAID') return 'Pago';
  if (status === 'PENDING') return 'Pendente';
  if (status === 'OVERDUE') return 'Atrasado';
  return 'Previsto';
}

function getKindLabel(kind) {
  if (kind === 'TRANSACTION') return 'Lançamento';
  if (kind === 'RECURRENCE_PREVIEW') return 'Previsão';
  if (kind === 'CREDIT_CARD_INVOICE') return 'Fatura';
  return kind;
}

export default function FinancialCalendarPage() {
  const navigate = useNavigate();
  const { formatCurrencyPrivacy } = usePrivacy();
  const now = new Date();

  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [filter, setFilter] = useState('all');

  const loadCalendar = useCallback(async (year, month) => {
    try {
      setLoading(true);
      setError('');
      const data = await getFinancialCalendarMonth({ year, month });
      setCalendarData(data);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : 'Não foi possível carregar o calendário financeiro. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar(currentYear, currentMonth);
  }, [currentYear, currentMonth, loadCalendar]);

  function goToToday() {
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  }

  function goToPrevMonth() {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleDayClick(day) {
    if (!day || day.events.length === 0) return;
    setSelectedDay(day);
  }

  function getFilteredEvents(events) {
    if (!events) return [];
    if (filter === 'all') return events;
    if (filter === 'INCOME') return events.filter((e) => e.type === 'INCOME');
    if (filter === 'EXPENSE') return events.filter((e) => e.type === 'EXPENSE');
    if (filter === 'PENDING') return events.filter((e) => e.status === 'PENDING');
    if (filter === 'RECURRENCE_PREVIEW') return events.filter((e) => e.kind === 'RECURRENCE_PREVIEW');
    return events;
  }

  function getFilteredDays(days) {
    if (!days) return [];
    if (filter === 'all') return days;

    return days.map((day) => {
      const filteredEvents = getFilteredEvents(day.events);
      if (filteredEvents.length === 0) return null;

      const filteredIncome = filteredEvents
        .filter((e) => e.type === 'INCOME')
        .reduce((sum, e) => sum + e.amount, 0);
      const filteredExpense = filteredEvents
        .filter((e) => e.type === 'EXPENSE')
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        ...day,
        income: Math.round(filteredIncome * 100) / 100,
        expense: Math.round(filteredExpense * 100) / 100,
        balance: Math.round((filteredIncome - filteredExpense) * 100) / 100,
        events: filteredEvents
      };
    }).filter(Boolean);
  }

  const days = calendarData?.days || [];
  const filteredDays = getFilteredDays(days);
  const summary = calendarData?.summary;

  const firstDayOfWeek = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(currentYear, currentMonth, 0)).getUTCDate();
  const daysInPrevMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 0)).getUTCDate();

  function buildCalendarCells() {
    const cells = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      cells.push({
        day,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        dateStr: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        events: [],
        income: 0,
        expense: 0,
        balance: 0
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = days.find((d) => d.date === dateStr) || {
        date: dateStr,
        income: 0,
        expense: 0,
        balance: 0,
        events: []
      };

      cells.push({
        day,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        ...dayData
      });
    }

    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      cells.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        dateStr: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        events: [],
        income: 0,
        expense: 0,
        balance: 0
      });
    }

    return cells;
  }

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const calendarCells = buildCalendarCells();

  const mobileDays = days.filter((d) => {
    if (filter === 'all') return d.events.length > 0;
    const filtered = getFilteredEvents(d.events);
    return filtered.length > 0;
  });

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Calendário financeiro"
          description="Visualize receitas, despesas e previsões organizadas por dia."
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-10 w-10 p-0" onClick={goToPrevMonth} disabled={loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="min-w-[180px] text-center text-lg font-semibold capitalize text-slate-900 dark:text-slate-100">
              {getMonthName(currentYear, currentMonth)}
            </h2>

            <Button variant="secondary" size="sm" className="h-10 w-10 p-0" onClick={goToNextMonth} disabled={loading}>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={goToToday} disabled={loading}>
              Hoje
            </Button>
          </div>

          <div className="w-full sm:w-48">
            <Select name="filter" value={filter} onChange={(e) => setFilter(e.target.value)} label="Filtrar">
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <LoadingSkeleton key={i} className="h-28 rounded-[28px]" />
            ))}
          </div>
        ) : error ? (
          <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6 dark:border-rose-800 dark:bg-rose-900/20">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Falha ao carregar calendário</p>
                <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => loadCalendar(currentYear, currentMonth)}>Tentar novamente</Button>
                </div>
              </div>
            </div>
          </Card>
        ) : !summary ? (
          <EmptyState
            icon={CalendarDays}
            title="Nenhum lançamento neste mês"
            description="Cadastre transações ou recorrências para visualizar sua agenda financeira."
            action={(
              <div className="flex flex-wrap justify-center gap-3">
                <Button as="a" href="/transactions" onClick={(e) => { e.preventDefault(); navigate('/transactions'); }}>
                  <Plus className="h-4 w-4" />
                  Nova transação
                </Button>
                <Button variant="secondary" as="a" href="/recurrences" onClick={(e) => { e.preventDefault(); navigate('/recurrences'); }}>
                  Nova recorrência
                </Button>
              </div>
            )}
          />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Receitas do mes"
                value={formatCurrencyPrivacy(summary.totalIncome)}
                description={`${summary.scheduledIncome > 0 ? formatCurrencyPrivacy(summary.scheduledIncome) + ' previstas' : ''}`}
              />
              <MetricCard
                title="Despesas do mes"
                value={formatCurrencyPrivacy(summary.totalExpense)}
                description={`${summary.scheduledExpense > 0 ? formatCurrencyPrivacy(summary.scheduledExpense) + ' previstas' : ''}`}
              />
              <MetricCard
                title="Pendentes"
                value={formatCurrencyPrivacy(summary.pendingExpense)}
                description={`${summary.pendingIncome > 0 ? formatCurrencyPrivacy(summary.pendingIncome) + ' a receber' : 'Despesas a pagar'}`}
              />
              <MetricCard
                title="Saldo previsto"
                value={formatCurrencyPrivacy(summary.projectedBalance)}
                description={`${summary.eventCount} eventos no mes`}
              />
            </div>

            <Card className="hidden overflow-hidden rounded-[28px] p-0 md:block">
              <div className="grid grid-cols-7">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="border-b border-slate-200 bg-slate-50 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
                  >
                    {day}
                  </div>
                ))}

                {calendarCells.map((cell, idx) => {
                  const isToday = cell.dateStr === todayStr;
                  const filteredEvents = getFilteredEvents(cell.events);
                  const hasEvents = filteredEvents.length > 0;
                  const visibleEvents = filteredEvents.slice(0, 3);
                  const moreCount = filteredEvents.length - 3;

                  const incomeTotal = filteredEvents
                    .filter((e) => e.type === 'INCOME')
                    .reduce((s, e) => s + e.amount, 0);
                  const expenseTotal = filteredEvents
                    .filter((e) => e.type === 'EXPENSE')
                    .reduce((s, e) => s + e.amount, 0);

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      type="button"
                      onClick={() => hasEvents && cell.isCurrentMonth && handleDayClick(cell)}
                      disabled={!hasEvents || !cell.isCurrentMonth}
                      className={`
                        min-h-[100px] border-b border-r border-slate-200 p-2 text-left transition
                        dark:border-slate-700
                        ${!cell.isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-800'}
                        ${isToday ? 'ring-2 ring-inset ring-emerald-400 dark:ring-emerald-500' : ''}
                        ${hasEvents && cell.isCurrentMonth ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50' : 'cursor-default'}
                      `}
                    >
                      <span
                        className={`
                          inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium
                          ${isToday ? 'bg-emerald-600 text-white' : ''}
                          ${!cell.isCurrentMonth ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}
                        `}
                      >
                        {cell.day}
                      </span>

                      {hasEvents && cell.isCurrentMonth && (
                        <div className="mt-1 space-y-0.5">
                          {incomeTotal > 0 && (
                            <p className="text-[11px] font-medium leading-tight text-emerald-600 dark:text-emerald-400">
                              +{formatCurrencyPrivacy(incomeTotal)}
                            </p>
                          )}
                          {expenseTotal > 0 && (
                            <p className="text-[11px] font-medium leading-tight text-rose-600 dark:text-rose-400">
                              -{formatCurrencyPrivacy(expenseTotal)}
                            </p>
                          )}
                          <div className="mt-1 space-y-0.5">
                            {visibleEvents.map((event) => (
                              <div
                                key={event.id}
                                className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] leading-tight"
                                style={{
                                  backgroundColor: event.type === 'INCOME'
                                    ? 'rgba(16,185,129,0.1)'
                                    : 'rgba(244,63,94,0.1)',
                                  color: event.type === 'INCOME' ? '#059669' : '#e11d48'
                                }}
                              >
                                <span className="truncate">{event.title}</span>
                              </div>
                            ))}
                          </div>
                          {moreCount > 0 && (
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              +{moreCount} mais
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="space-y-4 md:hidden">
              {mobileDays.length === 0 ? (
                <Card className="rounded-[28px] p-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nenhum evento encontrado com o filtro selecionado.
                  </p>
                </Card>
              ) : (
                mobileDays.map((day) => {
                  const dayEvents = getFilteredEvents(day.events);
                  const dayDate = new Date(day.date + 'T12:00:00');
                  const dayIncome = dayEvents.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
                  const dayExpense = dayEvents.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);

                  return (
                    <Card key={day.date} className="rounded-[28px] p-5">
                      <button
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold capitalize text-slate-900 dark:text-slate-100">
                              {dayDate.getDate()} de {dayDate.toLocaleDateString('pt-BR', { month: 'long' })}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                              {getDayName(day.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            {dayIncome > 0 && (
                              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                +{formatCurrencyPrivacy(dayIncome)}
                              </p>
                            )}
                            {dayExpense > 0 && (
                              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                                -{formatCurrencyPrivacy(dayExpense)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div key={event.id} className="flex items-center gap-2 text-sm">
                              <Badge variant={getStatusVariant(event.status)}>
                                {getStatusLabel(event.status)}
                              </Badge>
                              <span className="truncate text-slate-700 dark:text-slate-300">{event.title}</span>
                              <span className={`ml-auto shrink-0 font-medium ${event.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {event.type === 'INCOME' ? '+' : '-'}{formatCurrencyPrivacy(event.amount)}
                              </span>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              +{dayEvents.length - 3} mais eventos
                            </p>
                          )}
                        </div>
                      </button>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}

        <Modal
          isOpen={!!selectedDay}
          title={selectedDay ? `${new Date(selectedDay.date + 'T12:00:00').getDate()} de ${new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long' })}` : ''}
          onClose={() => setSelectedDay(null)}
        >
          {selectedDay && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receitas</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrencyPrivacy(selectedDay.income)}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-center dark:border-rose-800 dark:bg-rose-900/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Despesas</p>
                  <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                    {formatCurrencyPrivacy(selectedDay.expense)}
                  </p>
                </div>
                <div className={`rounded-2xl border p-3 text-center ${selectedDay.balance >= 0 ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' : 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20'}`}>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Saldo</p>
                  <p className={`text-lg font-semibold ${selectedDay.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatCurrencyPrivacy(selectedDay.balance)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {selectedDay.events.length} evento{selectedDay.events.length !== 1 ? 's' : ''} no dia
                </p>

                {selectedDay.events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{event.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant={event.type === 'INCOME' ? 'success' : 'danger'}>
                            {event.type === 'INCOME' ? 'Receita' : 'Despesa'}
                          </Badge>
                          <Badge variant={getStatusVariant(event.status)}>
                            {getStatusLabel(event.status)}
                          </Badge>
                        </div>
                      </div>
                      <span className={`shrink-0 text-lg font-semibold ${event.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {event.type === 'INCOME' ? '+' : '-'}{formatCurrencyPrivacy(event.amount)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      {event.category && (
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">Categoria</span>
                          <div className="flex items-center gap-1.5">
                            {event.category.color && (
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: event.category.color }}
                              />
                            )}
                            <p className="text-slate-900 dark:text-slate-100">{event.category.name}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Conta/Cartao</span>
                        <p className="text-slate-900 dark:text-slate-100">
                          {event.creditCard?.name || event.account?.name || '--'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Origem</span>
                        <p className="text-slate-900 dark:text-slate-100">{getKindLabel(event.kind)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Data</span>
                        <p className="text-slate-900 dark:text-slate-100">{formatDateBR(event.date)}</p>
                      </div>
                    </div>

                    {event.kind === 'TRANSACTION' && (
                      <div className="mt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          as="a"
                          href={`/transactions?highlight=${event.id}`}
                          onClick={(e) => { e.preventDefault(); setSelectedDay(null); navigate('/transactions'); }}
                        >
                          Ver transacoes
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
