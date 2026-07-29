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
import AccountsBalanceCard from '../components/dashboard/AccountsBalanceCard';
import MonthlyOverviewCard from '../components/dashboard/MonthlyOverviewCard';
import { PendingAlertsCard, QuickActionsCard } from '../components/dashboard/DashboardSideCards';
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
import { getAccounts } from '../services/accountService';
import { getInvoiceSummary } from '../services/invoiceService';
import { getFinancialSummary } from '../services/reportService';
import { useDataInvalidation } from '../utils/dataInvalidation';

const initialState = {
  overview: null,
  expensesByCategory: [],
  topExpenses: [],
  budgetStatus: [],
  goalsProgress: [],
  recentTransactions: [],
  monthlyFlow: [],
  financialTasks: null,
  accounts: [],
  dailySummary: null,
  invoiceSummary: null
};

function getTodayDateKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

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

        const today = getTodayDateKey();
        const endpoints = [
          { name: 'overview', fn: () => getDashboardOverview(period) },
          { name: 'expensesByCategory', fn: () => getExpensesByCategory(period) },
          { name: 'topExpenses', fn: () => getTopExpenses(period) },
          { name: 'budgetStatus', fn: () => getBudgetStatus(period) },
          { name: 'goalsProgress', fn: () => getGoalsProgress(period) },
          { name: 'recentTransactions', fn: () => getRecentTransactions(period) },
          { name: 'monthlyFlow', fn: () => getMonthlyFlow(period) },
          { name: 'financialTasks', fn: () => getFinancialTaskDashboard() },
          { name: 'accounts', fn: () => getAccounts() },
          { name: 'dailySummary', fn: () => getFinancialSummary({ startDate: today, endDate: today }) },
          { name: 'invoiceSummary', fn: () => getInvoiceSummary() }
        ];

        const [results] = await Promise.all([
          Promise.allSettled(endpoints.map(e => e.fn())),
          loadAvailablePeriods()
        ]);

        if (!isMounted) return;

        const responses = Object.fromEntries(endpoints.map((endpoint, index) => [
          endpoint.name,
          results[index].status === 'fulfilled' ? results[index].value : initialState[endpoint.name]
        ]));

        const criticalFailure = results.slice(0, 7).find((result) => result.status === 'rejected');
        if (criticalFailure) throw criticalFailure.reason;

        setData({
          overview: responses.overview,
          expensesByCategory: responses.expensesByCategory,
          topExpenses: responses.topExpenses,
          budgetStatus: responses.budgetStatus,
          goalsProgress: responses.goalsProgress,
          recentTransactions: responses.recentTransactions,
          monthlyFlow: responses.monthlyFlow,
          financialTasks: responses.financialTasks,
          accounts: results[8].status === 'fulfilled' ? responses.accounts : null,
          dailySummary: responses.dailySummary,
          invoiceSummary: responses.invoiceSummary
        });
      } catch (requestError) {
        if (!isMounted) return;

        setError(
          requestError.response?.status === 401
            ? 'Sua sessão expirou. Entre novamente para continuar.'
            : 'Não foi possível carregar o resumo financeiro agora. Tente novamente em instantes.'
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
      {({ openQuickAdd }) => (
      <div className="flex flex-col gap-5 pb-8">
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
          <section className="flex flex-col gap-5">
            <div className="grid gap-4 min-[1200px]:grid-cols-[minmax(0,1.62fr)_minmax(320px,0.95fr)]">
              <div className="space-y-4">
                <LoadingSkeleton variant="shimmer" className="h-64" />
                <LoadingSkeleton variant="shimmer" className="h-56" />
                <LoadingSkeleton variant="shimmer" className="h-44" />
              </div>
              <div className="space-y-4">
                <LoadingSkeleton variant="shimmer" className="h-80" />
                <LoadingSkeleton variant="shimmer" className="h-40" />
              </div>
            </div>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 min-[1521px]:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-44" />
              ))}
            </div>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 min-[1521px]:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-64" />
              ))}
            </div>
            <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
              {[1, 2].map((item) => (
                <LoadingSkeleton key={item} variant="shimmer" className="h-80" />
              ))}
            </div>
          </section>
        ) : null}

        {!loading && error ? (
          <Card className="border-danger/25 !bg-danger/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-content-primary">Falha ao carregar dados do dashboard</p>
                <p className="mt-2 text-sm text-danger">{error}</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setRefreshVersion((current) => current + 1)}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {!loading && !error ? (
          <div className="flex flex-col gap-5">
            <section className="grid items-start gap-4 min-[1200px]:grid-cols-[minmax(0,1.62fr)_minmax(320px,0.95fr)]">
              <div className="flex min-w-0 flex-col gap-4">
                <AccountsBalanceCard
                  accounts={data.accounts}
                  todayExpense={data.dailySummary?.expense}
                  totalBalance={data.overview?.summary?.totalBalance}
                />
                <MonthlyOverviewCard
                  periodLabel={selectedPeriodLabel}
                  summary={data.overview?.summary}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-4">
                <PendingAlertsCard
                  financialTasks={data.financialTasks}
                  invoiceSummary={data.invoiceSummary}
                  totalBalance={data.overview?.summary?.totalBalance}
                />
                <QuickActionsCard onAction={openQuickAdd} />
              </div>
            </section>

            <DashboardCard
              icon={Activity}
              title="Indicadores comparativos"
              description="Saldo, receitas, despesas e economia em relação ao mês anterior"
              color="slate"
              collapseKey="overview-comparisons"
              defaultCollapsed
            >
              <DashboardOverviewCards
                comparison={data.overview?.comparison}
                data={data.overview?.summary}
                periodLabel={selectedPeriodLabel}
                tenantName={tenant?.name}
              />
            </DashboardCard>

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
      )}
    </AppLayout>
  );
}

export default Dashboard;
