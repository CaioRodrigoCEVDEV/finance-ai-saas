import { useEffect, useState } from 'react';
import { Activity, AlertCircle, ChartNoAxesCombined, Layers3 } from 'lucide-react';

import ExpenseCategoryList from '../components/dashboard/ExpenseCategoryList';
import Card from '../components/ui/Card';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import MonthlyFlow from '../components/dashboard/MonthlyFlow';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import SummaryCard from '../components/dashboard/SummaryCard';
import AppLayout from '../layouts/AppLayout';
import {
  getDashboardSummary,
  getExpensesByCategory,
  getMonthlyFlow,
  getRecentTransactions
} from '../services/dashboardService';
import { formatCurrencyBRL, formatPercentage } from '../utils/formatters';

const initialState = {
  summary: null,
  expensesByCategory: [],
  recentTransactions: [],
  monthlyFlow: []
};

function Dashboard() {
  const { tenant, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [summaryResponse, expensesResponse, transactionsResponse, monthlyFlowResponse] = await Promise.all([
          getDashboardSummary(),
          getExpensesByCategory(),
          getRecentTransactions(),
          getMonthlyFlow()
        ]);

        if (!isMounted) {
          return;
        }

        setDashboardData({
          summary: summaryResponse.summary,
          expensesByCategory: expensesResponse,
          recentTransactions: transactionsResponse,
          monthlyFlow: monthlyFlowResponse
        });
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError.response?.status === 401
            ? 'Sua sessao expirou. Entre novamente para continuar.'
            : 'Nao foi possivel carregar o dashboard agora. Verifique se a API backend esta ativa e tente novamente.'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryCards = dashboardData.summary
    ? [
        {
          title: 'Saldo Total',
          value: formatCurrencyBRL(dashboardData.summary.totalBalance),
          description: `Posicao consolidada das contas de ${tenant?.name || 'Finance AI'}.`,
          variant: 'highlight'
        },
        {
          title: 'Receitas do mes',
          value: formatCurrencyBRL(dashboardData.summary.monthlyIncome),
          description: 'Entradas confirmadas no mes atual.',
          variant: 'positive'
        },
        {
          title: 'Despesas do mes',
          value: formatCurrencyBRL(dashboardData.summary.monthlyExpense),
          description: `${formatPercentage(dashboardData.summary.expensePercentage)} da receita mensal.`,
          variant: 'negative'
        },
        {
          title: 'Economia do mes',
          value: formatCurrencyBRL(dashboardData.summary.monthlyEconomy),
          description: 'Receitas menos despesas confirmadas.',
          variant: dashboardData.summary.monthlyEconomy >= 0 ? 'positive' : 'negative'
        }
      ]
    : [];

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Dashboard financeiro"
          description="Visao geral da operacao do tenant, com leitura clara de saldo, despesas, fluxo mensal e transacoes recentes."
          action={(
            <Card className="min-w-[220px] rounded-[24px] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Conta ativa</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{user?.name || 'Usuario autenticado'}</p>
              <p className="mt-1 text-sm text-slate-500">{tenant?.name || 'Finance AI'} • {tenant?.plan || 'FREE'}</p>
            </Card>
          )}
        />

        {loading ? (
          <section className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-40 rounded-[28px]" />)}
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <LoadingSkeleton className="h-[340px] rounded-[28px]" />
              <LoadingSkeleton className="h-[340px] rounded-[28px]" />
            </div>
            <LoadingSkeleton className="h-[320px] rounded-[28px]" />
          </section>
        ) : null}

        {!loading && error ? (
          <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">Falha ao carregar dados do dashboard</p>
                <p className="mt-2 text-sm text-rose-700">{error}</p>
              </div>
            </div>
          </Card>
        ) : null}

        {!loading && !error ? (
          <div className="space-y-8">
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <SummaryCard key={card.title} {...card} />
              ))}
            </section>

            <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-[28px] p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <Layers3 className="h-4 w-4" />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900">Gastos por categoria</h2>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Distribuicao das despesas confirmadas no mes.</p>
                  </div>
                </div>
                <ExpenseCategoryList items={dashboardData.expensesByCategory} />
              </Card>

              <Card className="rounded-[28px] p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                      <ChartNoAxesCombined className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Fluxo mensal</h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Panorama dos ultimos 6 meses.</p>
                </div>
                <MonthlyFlow items={dashboardData.monthlyFlow} />
              </Card>
            </section>

            <Card className="rounded-[28px] p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                    <Activity className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">Transacoes recentes</h2>
                </div>
                <p className="mt-2 text-sm text-slate-500">Ultimos lancamentos registrados na base.</p>
              </div>
              <RecentTransactions transactions={dashboardData.recentTransactions} />
            </Card>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}

export default Dashboard;
