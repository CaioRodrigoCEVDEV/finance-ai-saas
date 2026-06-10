import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, Landmark, Sparkles, Tags } from 'lucide-react';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const features = [
  {
    title: 'Dashboard inteligente',
    description: 'Resumo financeiro com leitura rapida de saldo, fluxo mensal e ultimas movimentacoes.',
    icon: LayoutDashboard
  },
  {
    title: 'Multi-contas',
    description: 'Organize bancos, carteiras, poupancas e investimentos em uma base consistente.',
    icon: Landmark
  },
  {
    title: 'Categorias automaticas',
    description: 'Estruture receitas e despesas com categorias padrao e personalizadas por tenant.',
    icon: Tags
  },
  {
    title: 'Open Finance em breve',
    description: 'Base visual preparada para conexoes futuras com dados financeiros externos.',
    icon: Sparkles
  }
];

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen w-full max-w-content flex-col gap-6">
        <header className="rounded-[32px] border border-slate-200 bg-white px-6 py-5 shadow-soft sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Finance AI</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Seu copiloto financeiro pessoal</h1>
            </div>
            <Button as={Link} to="/login">Acessar sistema</Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[32px] p-8 sm:p-10">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Premium fintech UI
            </span>
            <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Finance AI</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Centralize contas, acompanhe indicadores e evolua sua operacao financeira em uma interface clara, premium e confiavel.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/login" size="lg">
                Acessar sistema
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/dashboard" variant="secondary" size="lg">
                Ver dashboard demo
              </Button>
            </div>
          </Card>

          <Card className="rounded-[32px] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Visao rapida</p>
            <div className="mt-6 space-y-5">
              {[
                ['Saldo consolidado', 'R$ 24.580,90'],
                ['Receitas do mes', 'R$ 12.430,00'],
                ['Despesas do mes', 'R$ 7.890,30'],
                ['Economia projetada', 'R$ 4.539,70']
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="rounded-[28px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{feature.description}</p>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default HomePage;
