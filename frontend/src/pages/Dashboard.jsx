import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import DashboardOverviewCards from '../components/dashboard/DashboardOverviewCards';
import DashboardAlerts from '../components/dashboard/DashboardAlerts';
import CreditCardWidget from '../components/dashboard/CreditCardWidget';
import BudgetStatusWidget from '../components/dashboard/BudgetStatusWidget';
import GoalsProgressWidget from '../components/dashboard/GoalsProgressWidget';
import ExpensesByCategory from '../components/dashboard/ExpensesByCategory';
import TopExpensesWidget from '../components/dashboard/TopExpensesWidget';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import MonthlyFlow from '../components/dashboard/MonthlyFlow';

import {
  getDashboardOverview,
  getDashboardAlerts,
  getExpensesByCategory,
  getTopExpenses,
  getBudgetStatus,
  getGoalsProgress,
  getRecentTransactions,
  getMonthlyFlow
} from '../services/dashboardService';
import { formatCurrencyBRL, formatDateBR } from '../utils/formatters';
import { getGreeting, getFirstName } from '../utils/greeting';

const initialState = {
  overview: null,
  alerts: [],
  expensesByCategory: [],
  topExpenses: [],
  budgetStatus: [],
  goalsProgress: [],
  recentTransactions: [],
  monthlyFlow: []
};

function Dashboard() {
  const { user, tenant } = useAuth();
  const navigate = useNavigate();
  const firstName = getFirstName(user?.name);
  const greeting = getGreeting();
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [
          overviewRes,
          alertsRes,
          expensesRes,
          topExpensesRes,
          budgetStatusRes,
          goalsProgressRes,
          transactionsRes,
          monthlyFlowRes
        ] = await Promise.all([
          getDashboardOverview(),
          getDashboardAlerts(),
          getExpensesByCategory(),
          getTopExpenses(),
          getBudgetStatus(),
          getGoalsProgress(),
          getRecentTransactions(),
          getMonthlyFlow()
        ]);

        if (!isMounted) return;

        setData({
          overview: overviewRes,
          alerts: alertsRes,
          expensesByCategory: expensesRes,
          topExpenses: topExpensesRes,
          budgetStatus: budgetStatusRes,
          goalsProgress: goalsProgressRes,
          recentTransactions: transactionsRes,
          monthlyFlow: monthlyFlowRes
        });
      } catch (requestError) {
        if (!isMounted) return;

        setError(
          requestError.response?.status === 401
            ? 'Sua sessão expirou. Entre novamente para continuar.'
            : 'Não foi possível carregar o dashboard agora. Verifique se a API backend está ativa e tente novamente.'
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <Card className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Finance AI</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              {firstName ? `${greeting}, ${firstName}` : greeting}
              <span aria-hidden="true"> 👋</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Aqui está o resumo da sua vida financeira hoje.
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova transação
            </Button>
          </div>
        </Card>

        {loading ? (
          <section className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-40 rounded-[28px]" />)}
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => <LoadingSkeleton key={item} className="h-56 rounded-[28px]" />)}
            </div>
            <LoadingSkeleton className="h-40 rounded-[28px]" />
            <div className="grid gap-6 xl:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((item) => <LoadingSkeleton key={item} className="h-[340px] rounded-[28px]" />)}
            </div>
          </section>
        ) : null}

        {!loading && error ? (
          <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">Falha ao carregar dados do dashboard</p>
                <p className="mt-2 text-sm text-rose-700">{error}</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {!loading && !error ? (
          <div className="space-y-8">
            <DashboardOverviewCards data={data.overview?.summary} tenantName={tenant?.name} />

            <section className="grid gap-5 md:grid-cols-3">
              <CreditCardWidget data={data.overview?.creditCards} />
              <BudgetStatusWidget data={data.overview?.budgets} />
              <GoalsProgressWidget data={data.overview?.goals} />
            </section>

            <DashboardAlerts alerts={data.alerts} />

            <section className="grid gap-6 xl:grid-cols-2">
              <ExpensesByCategory items={data.expensesByCategory} />
              <TopExpensesWidget expenses={data.topExpenses} />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-[28px] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Orçamentos do mês</h2>
                </div>
                <div className="space-y-3">
                  {data.budgetStatus.map((b) => (
                    <div key={b.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{b.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{b.categoryName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(b.usedAmount)} de {formatCurrencyBRL(b.amount)}</p>
                          <p className={`text-xs font-medium ${b.status === 'EXCEEDED' ? 'text-rose-600' : b.status === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {b.status === 'EXCEEDED' ? 'Excedido' : b.status === 'WARNING' ? 'Quase no limite' : 'Dentro do orçamento'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-2 rounded-full ${b.status === 'EXCEEDED' ? 'bg-rose-500' : b.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(b.usedPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {data.budgetStatus.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum orçamento para o mês atual.</p>
                  )}
                </div>
              </Card>

              <Card className="rounded-[28px] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Metas em andamento</h2>
                </div>
                <div className="space-y-3">
                  {data.goalsProgress.map((g) => (
                    <div key={g.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{g.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Prazo: {g.deadline ? formatDateBR(g.deadline) : 'Sem prazo'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(g.currentAmount)} de {formatCurrencyBRL(g.targetAmount)}</p>
                          <p className="text-xs font-medium text-emerald-600">{g.progressPercentage.toFixed(2)}%</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {data.goalsProgress.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma meta ativa no momento.</p>
                  )}
                </div>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-[28px] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Transações recentes</h2>
                </div>
                <RecentTransactions transactions={data.recentTransactions} />
              </Card>

              <Card className="rounded-[28px] p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Fluxo mensal</h2>
                </div>
                <MonthlyFlow items={data.monthlyFlow} />
              </Card>
            </section>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}

export default Dashboard;
