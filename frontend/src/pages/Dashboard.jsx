import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ExpenseCategoryList from '../components/dashboard/ExpenseCategoryList';
import { useAuth } from '../contexts/AuthContext';
import MonthlyFlow from '../components/dashboard/MonthlyFlow';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import SummaryCard from '../components/dashboard/SummaryCard';
import MainLayout from '../layouts/MainLayout';
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
  const navigate = useNavigate();
  const { logout, tenant, user } = useAuth();
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

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <MainLayout>
      <header className="border-b border-slate-800 pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-brand-400">
              Dashboard em tempo real
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Finance AI Dashboard</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-300">Visao geral da sua vida financeira</p>
          </div>

          <div className="flex flex-col items-start gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300 lg:items-end">
            <div>
              <p className="font-semibold text-white">{user?.name || 'Usuario autenticado'}</p>
              <p className="mt-1">{tenant?.name || 'Finance AI'}</p>
              <p className="text-slate-400">{tenant?.role || 'MEMBER'} • {tenant?.plan || 'FREE'}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-slate-700 px-4 py-2 font-medium text-white transition hover:border-brand-400 hover:text-brand-300"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="py-10">
        {loading ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300 backdrop-blur-sm">
            <p className="text-lg font-medium text-white">Carregando dashboard...</p>
            <p className="mt-2 text-sm text-slate-400">Buscando saldo, categorias, transacoes e fluxo mensal.</p>
          </section>
        ) : null}

        {!loading && error ? (
          <section className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 backdrop-blur-sm">
            <p className="text-lg font-medium text-white">Falha ao carregar dados do dashboard</p>
            <p className="mt-2 text-sm text-rose-100">{error}</p>
          </section>
        ) : null}

        {!loading && !error ? (
          <div className="space-y-8">
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <SummaryCard key={card.title} {...card} />
              ))}
            </section>

            <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Gastos por categoria</h2>
                    <p className="mt-2 text-sm text-slate-400">Distribuicao das despesas confirmadas no mes.</p>
                  </div>
                </div>
                <ExpenseCategoryList items={dashboardData.expensesByCategory} />
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white">Fluxo mensal</h2>
                  <p className="mt-2 text-sm text-slate-400">Panorama dos ultimos 6 meses.</p>
                </div>
                <MonthlyFlow items={dashboardData.monthlyFlow} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Transacoes recentes</h2>
                <p className="mt-2 text-sm text-slate-400">Ultimos lancamentos registrados na base.</p>
              </div>
              <RecentTransactions transactions={dashboardData.recentTransactions} />
            </section>
          </div>
        ) : null}
      </main>
    </MainLayout>
  );
}

export default Dashboard;
