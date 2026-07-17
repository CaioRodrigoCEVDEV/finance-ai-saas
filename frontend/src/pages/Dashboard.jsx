import { useEffect, useMemo, useState } from 'react';

import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import DashboardOverviewCards from '../components/dashboard/DashboardOverviewCards';
import CreditCardWidget from '../components/dashboard/CreditCardWidget';
import BudgetStatusWidget from '../components/dashboard/BudgetStatusWidget';
import GoalsProgressWidget from '../components/dashboard/GoalsProgressWidget';
import FinancialTasksWidget from '../components/dashboard/FinancialTasksWidget';
import ExpensesByCategory from '../components/dashboard/ExpensesByCategory';
import TopExpensesWidget from '../components/dashboard/TopExpensesWidget';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import MonthlyFlow from '../components/dashboard/MonthlyFlow';
import DashboardPeriodHeader from '../components/dashboard/DashboardPeriodHeader';
import { usePrivacy } from '../contexts/PrivacyContext';
import {
  formatDashboardPeriodLabel,
  getCurrentDashboardPeriod,
  normalizeDashboardPeriod,
  readStoredDashboardPeriod,
  shiftPeriodByList,
  writeStoredDashboardPeriod
} from '../utils/dashboardPeriod';

import {
  getDashboardOverview,
  getExpensesByCategory,
  getTopExpenses,
  getBudgetStatus,
  getGoalsProgress,
  getRecentTransactions,
  getMonthlyFlow,
  getAvailablePeriods
} from '../services/dashboardService';
import { formatDateBR } from '../utils/formatters';
import { getFinancialTaskDashboard } from '../services/financialTaskService';

const initialState = {
  overview: null,
  expensesByCategory: [],
  topExpenses: [],
  budgetStatus: [],
  goalsProgress: [],
  recentTransactions: [],
  monthlyFlow: [],
  financialTasks: null
};

function Dashboard() {
  const { tenant } = useAuth();
  const { formatCurrencyPrivacy } = usePrivacy();
  const [data, setData] = useState(initialState);
  const [period, setPeriod] = useState(() => readStoredDashboardPeriod() || getCurrentDashboardPeriod());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState(null);
  const selectedPeriodLabel = useMemo(() => formatDashboardPeriodLabel(period.month, period.year), [period.month, period.year]);

  useEffect(() => {
    writeStoredDashboardPeriod(period);
  }, [period]);

  const updatePeriod = (nextPeriod) => {
    setPeriod((current) => {
      const normalized = normalizeDashboardPeriod(nextPeriod.month, nextPeriod.year);

      if (current.month === normalized.month && current.year === normalized.year) {
        return current;
      }

      return normalized;
    });
  };

  const goToPreviousPeriod = () => {
    setPeriod((current) => shiftPeriodByList(availablePeriods, current, -1));
  };

  const goToNextPeriod = () => {
    setPeriod((current) => shiftPeriodByList(availablePeriods, current, 1));
  };

  const goToToday = () => {
    setPeriod(getCurrentDashboardPeriod());
  };

  useEffect(() => {
    let isMounted = true;

    async function loadAvailablePeriods() {
      try {
        const periods = await getAvailablePeriods();
        if (isMounted) setAvailablePeriods(periods.length > 0 ? periods : null);
      } catch (_error) {
        /* silent */
      }
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const endpoints = [
          { name: 'overview', fn: () => getDashboardOverview(period) },
          { name: 'expensesByCategory', fn: () => getExpensesByCategory(period) },
          { name: 'topExpenses', fn: () => getTopExpenses(period) },
          { name: 'budgetStatus', fn: () => getBudgetStatus(period) },
          { name: 'goalsProgress', fn: () => getGoalsProgress(period) },
          { name: 'recentTransactions', fn: () => getRecentTransactions(period) },
          { name: 'monthlyFlow', fn: () => getMonthlyFlow(period) },
          { name: 'financialTasks', fn: () => getFinancialTaskDashboard() }
        ];

        const [results] = await Promise.all([
          Promise.allSettled(endpoints.map(e => e.fn())),
          loadAvailablePeriods()
        ]);

        if (!isMounted) return;

        const failed = [];
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const err = result.reason;
            const status = err?.response?.status || 'Network/CORS';
            console.error(`Dashboard: falha em ${endpoints[index].name} (${status})`, err);
            failed.push(`${endpoints[index].name} (${status})`);
          }
        });

        if (failed.length > 0) {
          throw { failedEndpoints: failed, firstError: results.find(r => r.status === 'rejected')?.reason };
        }

        const [
          overviewRes,
          expensesRes,
          topExpensesRes,
          budgetStatusRes,
          goalsProgressRes,
          transactionsRes,
          monthlyFlowRes,
          financialTasksRes
        ] = results.map(r => r.value);

        setData({
          overview: overviewRes,
          expensesByCategory: expensesRes,
          topExpenses: topExpensesRes,
          budgetStatus: budgetStatusRes,
          goalsProgress: goalsProgressRes,
          recentTransactions: transactionsRes,
          monthlyFlow: monthlyFlowRes,
          financialTasks: financialTasksRes
        });
      } catch (requestError) {
        if (!isMounted) return;

        if (requestError.failedEndpoints) {
          const joined = requestError.failedEndpoints.join(', ');
          const firstErr = requestError.firstError;
          const isCors = !firstErr?.response;
          setError(
            isCors
              ? `Bloqueio de CORS detectado — a origem ${window.location.origin} não está autorizada no backend. Verifique ALLOWED_ORIGINS no servidor.`
              : `Falha nos endpoints: ${joined}. Verifique o console para detalhes.`
          );
          return;
        }

        setError(
          requestError.response?.status === 401
            ? 'Sua sessão expirou. Entre novamente para continuar.'
            : `Erro inesperado: ${requestError.message || 'Verifique se a API backend está ativa.'}`
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [period]);

  return (
    <AppLayout>
      <div className="space-y-7 pb-8 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900/50">
        <DashboardPeriodHeader
          period={period}
          loading={loading}
          availablePeriods={availablePeriods}
          onPrevious={goToPreviousPeriod}
          onNext={goToNextPeriod}
          onToday={goToToday}
          onSelectPeriod={updatePeriod}
        />

        {loading ? (
          <section className="space-y-7">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-44 rounded-[28px]" />
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-64 rounded-[28px]" />
              ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              {[1, 2].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-80 rounded-[28px]" />
              ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              {[1, 2].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-80 rounded-[28px]" />
              ))}
            </div>
          </section>
        ) : null}

        {!loading && error ? (
          <Card className="rounded-[28px] border-rose-200 bg-gradient-to-br from-rose-50 to-rose-50/80 p-8
            dark:border-rose-800 dark:from-rose-900/20 dark:to-rose-900/10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Falha ao carregar dados do dashboard</p>
                <p className="mt-2 text-sm text-rose-700 dark:text-rose-400">{error}</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {!loading && !error ? (
          <div className="space-y-7">
            <DashboardOverviewCards
              comparison={data.overview?.comparison}
              data={data.overview?.summary}
              periodLabel={selectedPeriodLabel}
              tenantName={tenant?.name}
            />

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <CreditCardWidget data={data.overview?.creditCards} />
              <BudgetStatusWidget data={data.overview?.budgets} />
              <GoalsProgressWidget data={data.overview?.goals} />
              <FinancialTasksWidget data={data.financialTasks} />
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <ExpensesByCategory items={data.expensesByCategory} periodLabel={selectedPeriodLabel} />
              <TopExpensesWidget expenses={data.topExpenses} />
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
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
                      <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Orçamentos do período</h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Acompanhamento dos orçamentos</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {data.budgetStatus.map((b) => (
                    <div key={b.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{b.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{b.categoryName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyPrivacy(b.usedAmount)} de {formatCurrencyPrivacy(b.amount)}</p>
                          <p className={`text-xs font-medium ${b.status === 'EXCEEDED' ? 'text-rose-600' : b.status === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {b.status === 'EXCEEDED' ? 'Excedido' : b.status === 'WARNING' ? 'Quase no limite' : 'Dentro do orçamento'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${b.status === 'EXCEEDED' ? 'bg-rose-500' : b.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(b.usedPercentage, 100)}%` }}
                          >
                            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.budgetStatus.length === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
                        <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhum orçamento encontrado</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">para o período selecionado</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6
                dark:from-slate-800 dark:to-slate-800/80
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:scale-[1.01]
                hover:shadow-glow dark:hover:shadow-glow-dark hover:border-emerald-200
                dark:hover:border-emerald-800
                group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 transition-shadow duration-300 group-hover:shadow-md">
                      <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Metas do período</h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Progresso das metas ativas</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {data.goalsProgress.map((g) => (
                    <div key={g.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{g.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Prazo: {g.deadline ? formatDateBR(g.deadline) : 'Sem prazo'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyPrivacy(g.currentAmount)} de {formatCurrencyPrivacy(g.targetAmount)}</p>
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{g.progressPercentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                            style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                          >
                            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.goalsProgress.length === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
                        <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhuma meta ativa</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">no período selecionado</p>
                    </div>
                  )}
                </div>
              </Card>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6
                dark:from-slate-800 dark:to-slate-800/80
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:scale-[1.01]
                hover:shadow-glow dark:hover:shadow-glow-dark hover:border-amber-200
                dark:hover:border-amber-800
                group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/40 transition-shadow duration-300 group-hover:shadow-md">
                      <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Transações do período</h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Últimas movimentações</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <RecentTransactions transactions={data.recentTransactions} />
                </div>
              </Card>

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
                      <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Fluxo mensal selecionado</h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Receitas, despesas e saldo</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <MonthlyFlow items={data.monthlyFlow} />
                </div>
              </Card>
            </section>
          </div>
        ) : null}
      </div>

    </AppLayout>
  );
}

export default Dashboard;
