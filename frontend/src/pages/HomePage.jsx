import MainLayout from '../layouts/MainLayout';
import MetricCard from '../components/MetricCard';

const metrics = [
  {
    title: 'Saldo Total',
    value: 'R$ 24.580,90',
    description: 'Visao consolidada das suas contas e reservas.'
  },
  {
    title: 'Receitas',
    value: 'R$ 12.430,00',
    description: 'Entradas do periodo com classificacao automatizada.'
  },
  {
    title: 'Despesas',
    value: 'R$ 7.890,30',
    description: 'Gastos monitorados com foco em previsibilidade.'
  },
  {
    title: 'Economia do mes',
    value: 'R$ 4.539,70',
    description: 'Meta mensal acompanhada com assistencia inteligente.'
  }
];

function HomePage() {
  return (
    <MainLayout>
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-brand-400">
            Premium SaaS
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">Finance AI</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300 md:text-xl">
            Seu copiloto financeiro pessoal
          </p>
        </div>
        <div className="hidden rounded-3xl border border-slate-800 bg-white/5 p-5 text-right text-sm text-slate-300 lg:block">
          <p>Planejamento orientado por dados</p>
          <p className="mt-2 text-brand-400">Arquitetura pronta para multi-tenant</p>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center py-10">
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              description={metric.description}
            />
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Painel financeiro com base para IA</h2>
              <p className="mt-3 max-w-2xl text-slate-400">
                Estrutura inicial pronta para autenticacao, multi-tenant, dashboards e evolucao segura do produto.
              </p>
            </div>

            <button
              type="button"
              className="rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
            >
              Acessar Dashboard
            </button>
          </div>
        </section>
      </main>
    </MainLayout>
  );
}

export default HomePage;
