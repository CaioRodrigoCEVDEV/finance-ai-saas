import { useEffect, useMemo, useState } from 'react';

import { BarChart3, TrendingUp, Clock, Activity } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import DashboardCard from '../components/ui/DashboardCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import DashboardOverviewCards from '../components/dashboard/DashboardOverviewCards';
import CreditCardWidget from '../components/dashboard/CreditCardWidget';
import BudgetStatusWidget from '../components/dashboard/BudgetStatusWidget';
import GoalsProgressWidget from '../components/dashboard/GoalsProgressWidget';
import BudgetList from '../components/dashboard/BudgetList';
import GoalList from '../components/dashboard/GoalList';
import FinancialTasksWidget from '../components/dashboard/FinancialTasksWidget';
import ExpensesByCategory from '../components/dashboard/ExpensesByCategory';
import TopExpensesWidget from '../components/dashboard/TopExpensesWidget';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import MonthlyFlow from '../components/dashboard/MonthlyFlow';
import DashboardPeriodHeader from '../components/dashboard/DashboardPeriodHeader';
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
import { getFinancialTaskDashboard } from '../services/financialTaskService';
import { useDataInvalidation } from '../utils/dataInvalidation';

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
  const [data, setData] = useState(initialState);
  const [period, setPeriod] = useState(() => readStoredDashboardPeriod() || getCurrentDashboardPeriod());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const selectedPeriodLabel = useMemo(() => formatDashboardPeriodLabel(period.month, period.year), [period.month, period.year]);

  useDataInvalidation(['dashboard'], () => {
    setRefreshVersion((current) => current + 1);
  });

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
  }, [period, refreshVersion]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 pb-8 lg:gap-7">
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
          <section className="flex flex-col gap-6 lg:gap-7">
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 min-[1521px]:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-44 rounded-[28px]" />
              ))}
            </div>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 min-[1521px]:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-64 rounded-[28px]" />
              ))}
            </div>
            <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
              {[1, 2].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-80 rounded-[28px]" />
              ))}
            </div>
            <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
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
          <div className="flex flex-col gap-6 lg:gap-7">
            <DashboardOverviewCards
              comparison={data.overview?.comparison}
              data={data.overview?.summary}
              periodLabel={selectedPeriodLabel}
              tenantName={tenant?.name}
            />

            <section className="grid gap-4 sm:gap-5 md:grid-cols-2 min-[1521px]:grid-cols-4">
              <CreditCardWidget data={data.overview?.creditCards} />
              <BudgetStatusWidget data={data.overview?.budgets} />
              <GoalsProgressWidget data={data.overview?.goals} />
              <FinancialTasksWidget data={data.financialTasks} />
            </section>

            <section className="flex flex-col gap-4 sm:gap-5 xl:flex-row">
              <div className="flex flex-col gap-4 sm:gap-5 xl:w-1/2">
                <ExpensesByCategory
                  items={data.expensesByCategory}
                  periodLabel={selectedPeriodLabel}
                  collapseKey="expenses-by-category"
                />
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 xl:w-1/2">
                <TopExpensesWidget
                  expenses={data.topExpenses}
                  collapseKey="top-expenses"
                />
              </div>
            </section>

            <section className="flex flex-col gap-4 sm:gap-5 xl:flex-row">
              <div className="flex flex-col gap-4 sm:gap-5 xl:w-1/2">
                <DashboardCard
                  icon={BarChart3}
                  title="Orçamentos do período"
                  description="Acompanhamento dos orçamentos"
                  color="sky"
                  collapseKey="budget-status"
                >
                  <BudgetList items={data.budgetStatus} />
                </DashboardCard>
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 xl:w-1/2">
                <DashboardCard
                  icon={TrendingUp}
                  title="Metas do período"
                  description="Progresso das metas ativas"
                  color="emerald"
                  collapseKey="goals-progress"
                >
                  <GoalList items={data.goalsProgress} />
                </DashboardCard>
              </div>
            </section>

            <section className="flex flex-col gap-4 sm:gap-5 xl:flex-row">
              <div className="flex flex-col gap-4 sm:gap-5 xl:w-1/2">
                <DashboardCard
                  icon={Clock}
                  title="Transações do período"
                  description="Últimas movimentações"
                  color="amber"
                  collapseKey="recent-transactions"
                >
                  <RecentTransactions transactions={data.recentTransactions} />
                </DashboardCard>
              </div>
              <div className="flex flex-col gap-4 sm:gap-5 xl:w-1/2">
                <DashboardCard
                  icon={Activity}
                  title="Fluxo mensal selecionado"
                  description="Receitas, despesas e saldo"
                  color="sky"
                  collapseKey="monthly-flow"
                >
                  <MonthlyFlow items={data.monthlyFlow} />
                </DashboardCard>
              </div>
            </section>
          </div>
        ) : null}
      </div>

    </AppLayout>
  );
}

export default Dashboard;
