import { useEffect, useMemo, useState } from 'react';

import { BarChart3, TrendingUp, Clock, Activity } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import DashboardCard from '../components/ui/DashboardCard';
import ProgressBar from '../components/ui/ProgressBar';
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
              <DashboardCard
                icon={BarChart3}
                title="Orçamentos do período"
                description="Acompanhamento dos orçamentos"
                color="sky"
              >
                <div className="space-y-3">
                  {data.budgetStatus.map((b) => {
                    const barColor = b.status === 'EXCEEDED' ? 'rose' : b.status === 'WARNING' ? 'amber' : 'emerald';
                    return (
                      <div key={b.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{b.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{b.categoryName}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                              {formatCurrencyPrivacy(b.usedAmount)}
                              <span className="font-normal text-slate-400 dark:text-slate-500"> / {formatCurrencyPrivacy(b.amount)}</span>
                            </p>
                            <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              b.status === 'EXCEEDED'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                : b.status === 'WARNING'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                              {b.status === 'EXCEEDED' ? 'Excedido' : b.status === 'WARNING' ? 'Quase no limite' : 'Dentro do orçamento'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <ProgressBar value={b.usedPercentage} color={barColor} height="h-1.5" />
                        </div>
                      </div>
                    );
                  })}
                  {data.budgetStatus.length === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
                        <BarChart3 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhum orçamento encontrado</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">para o período selecionado</p>
                    </div>
                  )}
                </div>
              </DashboardCard>

              <DashboardCard
                icon={TrendingUp}
                title="Metas do período"
                description="Progresso das metas ativas"
                color="emerald"
              >
                <div className="space-y-3">
                  {data.goalsProgress.map((g) => {
                    const progressColor = g.progressPercentage >= 75 ? 'emerald' : g.progressPercentage >= 40 ? 'sky' : 'amber';
                    return (
                      <div key={g.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{g.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              Prazo: {g.deadline ? formatDateBR(g.deadline) : 'Sem prazo'}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                              {formatCurrencyPrivacy(g.currentAmount)}
                              <span className="font-normal text-slate-400 dark:text-slate-500"> / {formatCurrencyPrivacy(g.targetAmount)}</span>
                            </p>
                            <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              g.progressPercentage >= 75
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : g.progressPercentage >= 40
                                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {g.progressPercentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <ProgressBar value={g.progressPercentage} color={progressColor} height="h-1.5" />
                        </div>
                      </div>
                    );
                  })}
                  {data.goalsProgress.length === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
                        <TrendingUp className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhuma meta ativa</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">no período selecionado</p>
                    </div>
                  )}
                </div>
              </DashboardCard>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <DashboardCard
                icon={Clock}
                title="Transações do período"
                description="Últimas movimentações"
                color="amber"
              >
                <RecentTransactions transactions={data.recentTransactions} />
              </DashboardCard>

              <DashboardCard
                icon={Activity}
                title="Fluxo mensal selecionado"
                description="Receitas, despesas e saldo"
                color="sky"
              >
                <MonthlyFlow items={data.monthlyFlow} />
              </DashboardCard>
            </section>
          </div>
        ) : null}
      </div>

    </AppLayout>
  );
}

export default Dashboard;
