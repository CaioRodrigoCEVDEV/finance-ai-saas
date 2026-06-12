import { Crown, ShieldCheck } from 'lucide-react';

import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';

function Plans() {
  const { tenant } = useAuth();
  const currentPlan = tenant?.plan || 'FREE';

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Planos"
          description="Escolha o plano ideal para você e aproveite ao máximo o Finance AI."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[28px] p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Free</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Para começar a organizar suas finanças</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Grátis
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">para sempre</p>
            </div>

            <ul className="mt-8 space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                1 conta financeira
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                1 cartão de crédito
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Transações ilimitadas
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Dashboard completo
              </li>
            </ul>

            <div className="mt-8">
              {currentPlan === 'FREE' ? (
                <Button disabled size="lg" className="w-full">
                  Plano atual
                </Button>
              ) : (
                <Button variant="secondary" disabled size="lg" className="w-full">
                  Plano Free
                </Button>
              )}
            </div>
          </Card>

          <Card className="relative rounded-[28px] border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 dark:border-emerald-800 dark:from-emerald-950/50 dark:to-slate-900">
            <div className="absolute right-6 top-6">
              <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                Recomendado
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Premium</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Para quem quer recursos avançados</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Em breve
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">planos a partir de R$ 19,90/mês</p>
            </div>

            <ul className="mt-8 space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Contas financeiras ilimitadas
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Cartões de crédito ilimitados
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Orçamentos ilimitados
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Metas ilimitadas
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Importação de arquivos
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Relatórios avançados
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Regras de categorização
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Open Finance
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                IA para insights financeiros
              </li>
            </ul>

            <div className="mt-8">
              {currentPlan === 'PREMIUM' ? (
                <Button disabled size="lg" className="w-full">
                  Plano atual
                </Button>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  Em breve
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default Plans;
