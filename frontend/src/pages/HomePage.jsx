import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Download,
  Globe,
  LayoutDashboard,
  LineChart,
  Lock,
  PieChart,
  PiggyBank,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { trackInvite } from '../services/inviteService';

const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Planos', href: '#planos' },
  { label: 'Segurança', href: '#seguranca' },
];

const features = [
  {
    title: 'Dashboard financeiro completo',
    description: 'Resumo claro de saldo, receitas, despesas e evolução mensal em um painel premium com gráficos dinâmicos.',
    icon: LayoutDashboard,
  },
  {
    title: 'Controle de contas',
    description: 'Gerencie contas correntes, poupanças, investimentos e carteiras digitais com saldo computado em tempo real.',
    icon: Wallet,
  },
  {
    title: 'Cartões de crédito',
    description: 'Acompanhe limite disponível, faturas abertas e ciclo de fechamento de todos os seus cartões em um só lugar.',
    icon: CreditCard,
  },
  {
    title: 'Transações por categoria',
    description: 'Registre e categorize receitas e despesas com sugestão automática baseada em regras inteligentes.',
    icon: PieChart,
  },
  {
    title: 'Orçamentos mensais',
    description: 'Defina limites por categoria e receba alertas visuais quando estiver próximo de estourar o orçamento.',
    icon: TrendingUp,
  },
  {
    title: 'Metas financeiras',
    description: 'Crie metas de economia e acompanhe o progresso com indicadores claros de quanto falta para alcançar.',
    icon: Target,
  },
  {
    title: 'Importação CSV/OFX',
    description: 'Importe extratos bancários em lote com preview interativo e regras de categorização configuráveis.',
    icon: Download,
  },
  {
    title: 'Relatórios financeiros',
    description: 'Exporte dados, analise gastos por período e visualize a evolução do seu patrimônio com gráficos detalhados.',
    icon: BarChart3,
  },
];

const steps = [
  {
    number: '01',
    title: 'Cadastre suas contas',
    description: 'Adicione contas correntes, cartões de crédito e carteiras digitais. Tudo centralizado em um único painel.',
    icon: PiggyBank,
  },
  {
    number: '02',
    title: 'Registre ou importe movimentações',
    description: 'Lance transações manualmente ou importe extratos CSV/OFX com categorização automática inteligente.',
    icon: Download,
  },
  {
    number: '03',
    title: 'Acompanhe tudo pelo dashboard',
    description: 'Visualize saldos, orçamentos, metas e relatórios em tempo real. Decida com clareza e confiança.',
    icon: LayoutDashboard,
  },
];

const differentials = [
  {
    title: 'Multiusuário e workspace',
    description: 'Compartilhe o ambiente financeiro com sua família ou equipe. Cada workspace é totalmente isolado.',
    icon: Users,
  },
  {
    title: 'Segurança com autenticação',
    description: 'Acesso protegido por JWT httpOnly, bcrypt nas senhas e isolamento completo de dados entre usuários.',
    icon: Lock,
  },
  {
    title: 'Dados organizados por ambiente',
    description: 'Contas, cartões, transações e categorias organizados por workspace. Cada ambiente com suas próprias regras.',
    icon: Globe,
  },
  {
    title: 'Preparado para Open Finance e IA',
    description: 'Infraestrutura pronta para conexão com instituições financeiras e recursos de inteligência financeira.',
    icon: Sparkles,
  },
];

const mockupCards = [
  { label: 'Saldo total', value: 'R$ 24.580,90', accent: true },
  { label: 'Despesas do mês', value: 'R$ 7.890,30', accent: false },
  { label: 'Orçamentos', value: '3 de 5 no limite', accent: false },
  { label: 'Metas', value: '2 de 4 concluídas', accent: false },
  { label: 'Cartões', value: '3 ativos', accent: false },
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
      .catch(() => {});
  }, [searchParams]);

  return (
    <div className="min-h-screen min-h-[100dvh] transition-colors">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Finance AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex">
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Entrar
              </Button>
            </div>
            <Button as={Link} to="/register" size="sm" className="whitespace-nowrap text-xs sm:text-sm">
              Começar grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 relative z-10">
        {referralMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
            {referralMessage}
          </div>
        )}

        {/* Hero Section */}
        <section className="relative grid gap-8 lg:grid-cols-[1.2fr_0.9fr] pt-8">
          <div>
            <Badge variant="success" className="mb-5">
              Finanças pessoais simples, modernas e inteligentes
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
              Controle sua vida financeira{' '}
              <span className="text-emerald-600 dark:text-emerald-400">com clareza</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
              Organize contas, cartões, despesas, metas e orçamentos em um painel moderno feito para
              acompanhar sua rotina financeira.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/register" size="lg">
                Começar grátis
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/login" variant="secondary" size="lg">
                Entrar na minha conta
              </Button>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-emerald-500/10 to-slate-500/5 dark:from-emerald-500/5 dark:to-slate-500/10 blur-2xl" />
            <Card className="relative rounded-[28px] p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                    Finance AI
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Dashboard
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-rose-400" />
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
              </div>

              {/* Mockup Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {mockupCards.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border p-3 ${
                      item.accent
                        ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-900/15'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                    }`}
                  >
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p
                      className={`mt-1 text-sm font-semibold tracking-tight sm:text-base ${
                        item.accent
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mini graph bar */}
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Evolução mensal</p>
                <div className="mt-2 flex items-end gap-1.5">
                  {[35, 55, 40, 70, 50, 85, 60, 90, 75, 95, 80, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full bg-slate-300 dark:bg-slate-600"
                      style={{ height: `${h * 0.25}px` }}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all"
                        style={{ height: `${h * 0.25}px`, opacity: 0.7 + h * 0.003 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section id="recursos" className="mt-16 scroll-mt-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              Funcionalidades
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
              Ferramentas completas para organizar, acompanhar e evoluir sua vida financeira com
              clareza e segurança.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="group rounded-[28px] transition hover:shadow-glow dark:hover:shadow-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="como-funciona" className="mt-20 scroll-mt-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Comece em 3 passos simples
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
              Em poucos minutos você já pode estar organizando suas finanças.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-14 hidden h-[calc(100%-3.5rem)] w-px bg-gradient-to-b from-emerald-200 to-transparent dark:from-emerald-800 md:block" />
                  )}
                  <Card className="relative rounded-[28px]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                      Passo {step.number}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {step.description}
                    </p>
                  </Card>
                </div>
              );
            })}
          </div>
        </section>

        {/* Differentials Section */}
        <section id="seguranca" className="mt-20 scroll-mt-20">
          <Card className="rounded-[32px] overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-emerald-50/50 p-0 dark:from-slate-900 dark:to-emerald-950/20">
            <div className="px-6 py-10 sm:p-12">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
                  Diferenciais
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                  Por que escolher o Finance AI?
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
                  Uma plataforma construída para evoluir junto com suas necessidades financeiras.
                </p>
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {differentials.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>

        {/* Plans Section */}
        <section id="planos" className="mt-20 scroll-mt-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              Planos
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Escolha o plano ideal para você
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
              Comece grátis e evolua conforme sua necessidade.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 items-stretch">
            <Card className="rounded-[32px] p-8 sm:p-10 h-full flex flex-col">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Free</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ideal para começar</p>
              </div>
              <div className="mt-6 flex-1 space-y-3">
                {[
                  '1 conta financeira',
                  '1 cartão de crédito',
                  'Até 200 transações/mês',
                  'Dashboard e lançamentos essenciais',
                  'Categorização básica',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <Button as={Link} to="/register" className="w-full" size="lg">
                  Começar grátis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className="rounded-[32px] border-emerald-200 p-8 shadow-glow sm:p-10 h-full flex flex-col dark:border-emerald-800 dark:shadow-none">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Premium</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Para quem quer ir além
                  </p>
                </div>
                <Badge variant="success">Mais popular</Badge>
              </div>
              <div className="mt-6 flex-1 space-y-3">
                {[
                  'Contas ilimitadas',
                  'Cartões ilimitados',
                  'Transações ilimitadas',
                  'Importação CSV/OFX',
                  'Relatórios financeiros avançados',
                  'Regras de categorização inteligentes',
                  'Suporte a múltiplos usuários',
                  'Open Finance e IA (em breve)',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <Button as={Link} to="/login" variant="secondary" className="w-full" size="lg">
                  Entrar na minha conta
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-20">
          <Card className="rounded-[32px] overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-emerald-800 p-0 text-center dark:from-emerald-700 dark:to-emerald-950">
            <div className="px-6 py-14 sm:px-12 sm:py-20">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Comece hoje a organizar sua vida financeira
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-emerald-100">
                Tenha mais clareza sobre para onde seu dinheiro vai e tome decisões melhores todos os
                meses.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button as={Link} to="/register" variant="primary" size="lg">
                  Começar grátis
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button as={Link} to="/login" variant="lightOnBrand" size="lg">
                  Entrar
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 py-10 dark:border-slate-800">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Finance AI
                </span>
              </Link>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Sua plataforma de finanças pessoais inteligente, segura e moderna.
              </p>
            </div>

            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Links
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Entrar
                  </Link>
                  <a
                    href="#recursos"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Recursos
                  </a>
                  <a
                    href="#seguranca"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Segurança
                  </a>
                  <Link
                    to="/privacy"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Política de Privacidade
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Produto
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href="#como-funciona"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Como funciona
                  </a>
                  <a
                    href="#planos"
                    className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Planos
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} Finance AI. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default HomePage;
