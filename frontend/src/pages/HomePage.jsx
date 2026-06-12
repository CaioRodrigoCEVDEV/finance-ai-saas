import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Download,
  LayoutDashboard,
  LineChart,
  PiggyBank,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { trackInvite } from '../services/inviteService';

const features = [
  {
    title: 'Dashboard inteligente',
    description: 'Resumo financeiro com leitura rápida de saldo, fluxo mensal e últimas movimentações em um painel premium.',
    icon: LayoutDashboard
  },
  {
    title: 'Controle de transações',
    description: 'Registre receitas, despesas, transferências e investimentos com categorização automática inteligente.',
    icon: TrendingUp
  },
  {
    title: 'Orçamentos e metas',
    description: 'Defina limites por categoria e acompanhe metas financeiras com alertas de progresso em tempo real.',
    icon: Target
  },
  {
    title: 'Importação CSV/OFX',
    description: 'Importe extratos bancários em CSV ou OFX com preview interativo e regras de categorização configuráveis.',
    icon: Download
  },
  {
    title: 'Multi-contas e cartões',
    description: 'Gerencie contas correntes, poupanças, investimentos e cartões de crédito em uma base unificada.',
    icon: PiggyBank
  },
  {
    title: 'Open Finance em breve',
    description: 'Infraestrutura preparada para conexões futuras com instituições financeiras via Open Finance.',
    icon: Sparkles
  },
  {
    title: 'Relatórios detalhados',
    description: 'Exporte dados, acompanhe evolução mensal e analise gastos por categoria, conta ou cartão.',
    icon: BarChart3
  },
  {
    title: 'Seus dados protegidos',
    description: 'Isolamento completo de dados por workspace. Perfeito para uso pessoal e familiar.',
    icon: LineChart
  }
];

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [referralMessage, setReferralMessage] = useState(null);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (!refCode) return;

    const storedCode = localStorage.getItem('financeai_referral_code');
    if (storedCode === refCode) return;

    localStorage.setItem('financeai_referral_code', refCode);

    trackInvite(refCode)
      .then((result) => {
        if (result.valid) {
          setReferralMessage('Você acessou por um convite. Conheça o Finance AI.');
        }
      })
      .catch(() => {
        // silently ignore tracking errors
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto flex min-h-screen w-full max-w-content flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="rounded-[32px] border border-slate-200 bg-white px-6 py-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">Finance AI</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                Seu copiloto financeiro pessoal
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
                Controle contas, cartões, transações, metas e orçamentos em um painel financeiro premium.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button as={Link} to="/register" size="lg">
                Começar grátis
              </Button>
              <Button as={Link} to="/login" variant="secondary" size="lg">
                Entrar no sistema
              </Button>
              {isAuthenticated ? (
                <Button as={Link} to="/dashboard" variant="secondary" size="lg">
                  Ver dashboard
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        {referralMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
            {referralMessage}
          </div>
        )}

        {/* Hero */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[32px] p-8 sm:p-10">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Premium fintech UI
            </span>
            <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              Finance AI
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Centralize contas, acompanhe indicadores e evolua sua operação financeira em
              uma interface clara, premium e confiável. Tudo isolado por workspace com
              autenticação segura.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/register" size="lg">
                Começar grátis
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/login" variant="secondary" size="lg">
                Entrar no sistema
              </Button>
              {isAuthenticated ? (
                <Button as={Link} to="/dashboard" variant="secondary" size="lg">
                  Ir para dashboard
                </Button>
              ) : null}
            </div>
          </Card>

          <Card className="rounded-[32px] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Visão rápida
            </p>
            <div className="mt-6 space-y-5">
              {[
                ['Saldo consolidado', 'R$ 24.580,90'],
                ['Receitas do mês', 'R$ 12.430,00'],
                ['Despesas do mês', 'R$ 7.890,30'],
                ['Economia projetada', 'R$ 4.539,70']
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50"
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Features */}
        <section className="mt-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              Funcionalidades
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Tudo que você precisa em um só lugar
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="rounded-[28px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto py-8">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 text-center shadow-soft dark:border-slate-700 dark:bg-slate-800 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              Finance AI
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Seu copiloto financeiro pessoal — seguro, premium e pronto para produção.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button as={Link} to="/register">
                Começar grátis
                <ArrowRight className="h-4 w-4" />
              </Button>
              {isAuthenticated ? (
                <Button as={Link} to="/dashboard" variant="secondary">
                  Ir para dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button as={Link} to="/login" variant="secondary">
                  Entrar no sistema
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default HomePage;
