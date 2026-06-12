import { Crown, ShieldCheck, Check } from 'lucide-react';

import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';

function FeatureItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  );
}

function Plans() {
  const { tenant } = useAuth();
  const currentPlan = tenant?.plan || 'FREE';

  const isFree = currentPlan === 'FREE';
  const isPremium = currentPlan === 'PREMIUM';

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Current plan indicator */}
        <div
          className={`rounded-2xl border p-4 ${
            isFree
              ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
              : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isFree
                  ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  : 'bg-emerald-200 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300'
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {isFree ? 'Você está no plano Free' : 'Você está no plano Premium'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isFree
                  ? 'Aproveite os recursos gratuitos e faça upgrade quando precisar de mais.'
                  : 'Aproveite todos os recursos ilimitados do Finance AI.'}
              </p>
            </div>
          </div>
        </div>

        <PageHeader
          title="Planos"
          description="Escolha o plano ideal para você e aproveite ao máximo o Finance AI."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Free Plan */}
          <Card className="relative flex flex-col p-8">
            {isFree && (
              <div className="absolute right-6 top-6">
                <Badge variant="neutral">Plano atual</Badge>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Free</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Para começar sua jornada financeira
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">R$ 0</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/mês</span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Grátis para sempre</p>
            </div>

            <ul className="mt-8 flex-1 space-y-3.5">
              <FeatureItem>1 conta financeira</FeatureItem>
              <FeatureItem>1 cartão de crédito</FeatureItem>
              <FeatureItem>Dashboard básico</FeatureItem>
              <FeatureItem>Transações manuais</FeatureItem>
              <FeatureItem>Orçamentos limitados</FeatureItem>
              <FeatureItem>Metas limitadas</FeatureItem>
            </ul>

            <div className="mt-8">
              {isFree ? (
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

          {/* Premium Plan */}
          <Card className="relative flex flex-col overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-8 dark:border-emerald-800 dark:from-emerald-950/20 dark:to-slate-800">
            <div className="absolute right-6 top-6">
              {isPremium ? (
                <Badge variant="success">Plano atual</Badge>
              ) : (
                <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  Recomendado
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Premium</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Para quem quer recursos avançados
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">R$ 29,90</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/mês</span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Cobre tudo que você precisa
              </p>
            </div>

            <ul className="mt-8 flex-1 space-y-3.5">
              <FeatureItem>Contas financeiras ilimitadas</FeatureItem>
              <FeatureItem>Cartões de crédito ilimitados</FeatureItem>
              <FeatureItem>Importação CSV/OFX</FeatureItem>
              <FeatureItem>Relatórios completos</FeatureItem>
              <FeatureItem>Regras automáticas de categorização</FeatureItem>
              <FeatureItem>Orçamentos ilimitados</FeatureItem>
              <FeatureItem>Metas ilimitadas</FeatureItem>
              <FeatureItem>Open Finance (em breve)</FeatureItem>
              <FeatureItem>IA financeira (em breve)</FeatureItem>
            </ul>

            <div className="mt-8">
              {isPremium ? (
                <Button disabled size="lg" className="w-full">
                  Plano atual
                </Button>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  Fazer upgrade
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
