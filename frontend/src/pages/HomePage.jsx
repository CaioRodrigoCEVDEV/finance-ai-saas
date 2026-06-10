import { Link } from 'react-router-dom';
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

const features = [
  {
    title: 'Dashboard inteligente',
    description: 'Resumo financeiro com leitura rapida de saldo, fluxo mensal e ultimas movimentacoes em um painel premium.',
    icon: LayoutDashboard
  },
  {
    title: 'Controle de transacoes',
    description: 'Registre receitas, despesas, transferencias e investimentos com categorizacao automatica inteligente.',
    icon: TrendingUp
  },
  {
    title: 'Orcamentos e metas',
    description: 'Defina limites por categoria e acompanhe metas financeiras com alertas de progresso em tempo real.',
    icon: Target
  },
  {
    title: 'Importacao CSV/OFX',
    description: 'Importe extratos bancarios em CSV ou OFX com preview interativo e regras de categorizacao configurativeis.',
    icon: Download
  },
  {
    title: 'Multi-contas e cartoes',
    description: 'Gerencie contas correntes, poupancas, investimentos e cartoes de credito em uma base unificada.',
    icon: PiggyBank
  },
  {
    title: 'Open Finance em breve',
    description: 'Infraestrutura preparada para conexoes futuras com instituicoes financeiras via Open Finance.',
    icon: Sparkles
  },
  {
    title: 'Relatorios detalhados',
    description: 'Exporte dados, acompanhe evolucao mensal e analise gastos por categoria, conta ou cartao.',
    icon: BarChart3
  },
  {
    title: 'Multi-tenant seguro',
    description: 'Cada tenant opera com isolamento completo de dados. Perfeito para empresas e uso pessoal.',
    icon: LineChart
  }
];

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-content flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="rounded-[32px] border border-slate-200 bg-white px-6 py-5 shadow-soft sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Finance AI</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Seu copiloto financeiro pessoal
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-500">
                Controle contas, cartoes, transacoes, metas e orcamentos em um painel financeiro premium.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button as={Link} to="/login" size="lg">
                Entrar no sistema
              </Button>
              {isAuthenticated ? (
                <Button as={Link} to="/dashboard" variant="secondary" size="lg">
                  Ver dashboard
                </Button>
              ) : (
                <Button as={Link} to="/login" variant="secondary" size="lg">
                  Ver dashboard
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[32px] p-8 sm:p-10">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Premium fintech UI
            </span>
            <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Finance AI
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Centralize contas, acompanhe indicadores e evolua sua operacao financeira em
              uma interface clara, premium e confiavel. Tudo isolado por tenant com
              autenticacao segura.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/login" size="lg">
                Entrar no sistema
                <ArrowRight className="h-4 w-4" />
              </Button>
              {isAuthenticated ? (
                <Button as={Link} to="/dashboard" variant="secondary" size="lg">
                  Ir para dashboard
                </Button>
              ) : null}
            </div>
          </Card>

          <Card className="rounded-[32px] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Visao rapida
            </p>
            <div className="mt-6 space-y-5">
              {[
                ['Saldo consolidado', 'R$ 24.580,90'],
                ['Receitas do mes', 'R$ 12.430,00'],
                ['Despesas do mes', 'R$ 7.890,30'],
                ['Economia projetada', 'R$ 4.539,70']
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Features */}
        <section className="mt-6">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
              Funcionalidades
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Tudo que voce precisa em um so lugar
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="rounded-[28px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto py-8">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 text-center shadow-soft sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
              Finance AI
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Seu copiloto financeiro pessoal — seguro, premium e pronto para producao.
            </p>
            <div className="mt-5">
              {isAuthenticated ? (
                <Button as={Link} to="/dashboard">
                  Ir para dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button as={Link} to="/login">
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
