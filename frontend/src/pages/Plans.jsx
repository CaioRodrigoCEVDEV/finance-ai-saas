import { Crown, ShieldCheck, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createBillingCheckout, createCustomerPortal, getBillingCurrent, getBillingPlans } from '../services/billingService';

function FeatureItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  );
}

function Plans() {
  const { tenant, updateTenant } = useAuth();
  const toast = useToast();
  const currentPlan = tenant?.plan || 'FREE';
  const [billingCurrent, setBillingCurrent] = useState(null);
  const [catalog, setCatalog] = useState({ plans: [], gateways: [] });
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);

  const isFree = currentPlan === 'FREE';
  const isPremium = currentPlan === 'PREMIUM';
  const monthlyPlan = useMemo(() => catalog.plans.find((item) => item.billingCycle === 'MONTHLY'), [catalog.plans]);
  const yearlyPlan = useMemo(() => catalog.plans.find((item) => item.billingCycle === 'YEARLY'), [catalog.plans]);

  useEffect(() => {
    async function loadBilling() {
      try {
        const [current, plans] = await Promise.all([getBillingCurrent(), getBillingPlans()]);
        setBillingCurrent(current);
        setCatalog(plans);
        const defaultProvider = plans.plans.find((item) => item.billingCycle === 'MONTHLY')?.defaultProvider || plans.gateways[0]?.provider || '';
        setProvider(defaultProvider);
        if (current?.plan === 'PREMIUM' && current?.status === 'ACTIVE') {
          updateTenant({ plan: 'PREMIUM' });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Falha ao carregar dados de assinatura.');
      }
    }

    loadBilling();
  }, [toast, updateTenant]);

  async function handleUpgrade() {
    try {
      setLoading(true);
      const checkout = await createBillingCheckout({
        billingCycle,
        provider: provider || undefined
      });

      window.location.href = checkout.checkoutUrl;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao iniciar checkout.');
      setLoading(false);
    }
  }

  async function handlePortal() {
    try {
      const portal = await createCustomerPortal();
      if (!portal.available) {
        toast.error(portal.message);
        return;
      }

      window.location.href = portal.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao abrir portal do cliente.');
    }
  }

  function formatPrice(plan) {
    if (!plan) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: plan.currency || 'BRL'
    }).format(plan.amount || 0);
  }

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
                  : `Status atual: ${billingCurrent?.status || 'ACTIVE'}. Aproveite todos os recursos ilimitados do Finance AI.`}
              </p>
            </div>
          </div>
        </div>

        <PageHeader
          title="Planos"
          description="Escolha o plano ideal para você e aproveite ao máximo o Finance AI."
        />

        {!isFree ? (
          <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Meu plano</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {billingCurrent?.provider || 'PREMIUM'} {billingCurrent?.billingCycle ? `• ${billingCurrent.billingCycle}` : ''}
              </p>
            </div>
            <Button variant="secondary" onClick={handlePortal}>Gerenciar assinatura</Button>
          </Card>
        ) : null}

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
                <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{formatPrice(monthlyPlan)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/{billingCycle === 'YEARLY' ? 'ano' : 'mês'}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {billingCycle === 'YEARLY' ? `Plano anual: ${formatPrice(yearlyPlan)}` : 'Cobre tudo que você precisa'}
              </p>
            </div>

            {isFree ? (
              <div className="mt-6 grid gap-4 rounded-[24px] border border-emerald-200 bg-white/70 p-4 dark:border-emerald-800 dark:bg-slate-900/20">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Ciclo de cobrança</p>
                    <div className="flex gap-2">
                      <Button variant={billingCycle === 'MONTHLY' ? 'primary' : 'secondary'} size="sm" onClick={() => setBillingCycle('MONTHLY')}>Mensal</Button>
                      <Button variant={billingCycle === 'YEARLY' ? 'primary' : 'secondary'} size="sm" onClick={() => setBillingCycle('YEARLY')}>Anual</Button>
                    </div>
                  </div>
                  {(catalog.plans.find((item) => item.billingCycle === billingCycle)?.allowProviderSelection ?? true) ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Gateway</span>
                      <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" value={provider} onChange={(event) => setProvider(event.target.value)}>
                        {catalog.gateways.map((gateway) => (
                          <option key={gateway.provider} value={gateway.provider}>{gateway.provider}</option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
              </div>
            ) : null}

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
                <Button size="lg" className="w-full" onClick={handleUpgrade} disabled={loading}>
                  Assinar Premium
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
