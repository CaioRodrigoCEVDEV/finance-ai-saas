import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, CreditCard, ReceiptText, RefreshCcw, ShieldCheck, Webhook } from 'lucide-react';

import AdminLayout from '../../layouts/admin/AdminLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';
import {
  getPaymentSettings,
  listPaymentEvents,
  testMercadoPagoSettings,
  testStripeSettings,
  updateBillingPlans,
  updateMercadoPagoSettings,
  updateStripeSettings
} from '../../services/adminService';

const tabs = ['Stripe', 'Mercado Pago', 'Planos', 'Webhooks', 'Logs'];

function Toggle({ value, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 disabled:opacity-60 dark:focus-visible:ring-emerald-900/30 ${
        value ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function EmptyValue({ value, fallback = '' }) {
  return value || fallback;
}

function PaymentSettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Stripe');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState('');
  const [eventsLoading, setEventsLoading] = useState(false);
  const [events, setEvents] = useState([]);

  const [stripeForm, setStripeForm] = useState({
    enabled: false,
    environment: 'SANDBOX',
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    monthlyPlanExternalId: '',
    yearlyPlanExternalId: '',
    successUrl: '',
    cancelUrl: ''
  });

  const [mercadoPagoForm, setMercadoPagoForm] = useState({
    enabled: false,
    environment: 'SANDBOX',
    publicKey: '',
    accessToken: '',
    webhookSecret: '',
    monthlyPlanExternalId: '',
    yearlyPlanExternalId: '',
    successUrl: '',
    failureUrl: '',
    pendingUrl: '',
    webhookUrl: ''
  });

  const [plansForm, setPlansForm] = useState({
    monthlyAmount: '29.90',
    yearlyAmount: '299.90',
    currency: 'BRL',
    defaultProvider: 'STRIPE',
    allowProviderSelection: true
  });

  const webhookUrls = useMemo(() => ({
    stripe: 'https://back.financeai.orderup.com.br/webhooks/stripe',
    mercadoPago: 'https://back.financeai.orderup.com.br/webhooks/mercado-pago'
  }), []);

  const loadEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      const response = await listPaymentEvents({ limit: 20 });
      setEvents(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao carregar logs de pagamento.');
    } finally {
      setEventsLoading(false);
    }
  }, [toast]);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPaymentSettings();
      const stripe = response.gateways.find((item) => item.provider === 'STRIPE');
      const mercadoPago = response.gateways.find((item) => item.provider === 'MERCADO_PAGO');
      const monthlyPlan = response.plans.find((item) => item.plan === 'PREMIUM' && item.billingCycle === 'MONTHLY');
      const yearlyPlan = response.plans.find((item) => item.plan === 'PREMIUM' && item.billingCycle === 'YEARLY');

      if (stripe) {
        setStripeForm((prev) => ({
          ...prev,
          enabled: stripe.enabled,
          environment: stripe.environment,
          publicKey: stripe.publicKey || '',
          secretKey: stripe.secretKeyMasked || '',
          webhookSecret: stripe.webhookSecretMasked || '',
          monthlyPlanExternalId: stripe.monthlyPlanExternalId || '',
          yearlyPlanExternalId: stripe.yearlyPlanExternalId || '',
          successUrl: stripe.successUrl || '',
          cancelUrl: stripe.cancelUrl || ''
        }));
      }

      if (mercadoPago) {
        setMercadoPagoForm((prev) => ({
          ...prev,
          enabled: mercadoPago.enabled,
          environment: mercadoPago.environment,
          publicKey: mercadoPago.publicKey || '',
          accessToken: mercadoPago.secretKeyMasked || '',
          webhookSecret: mercadoPago.webhookSecretMasked || '',
          monthlyPlanExternalId: mercadoPago.monthlyPlanExternalId || '',
          yearlyPlanExternalId: mercadoPago.yearlyPlanExternalId || '',
          successUrl: mercadoPago.successUrl || '',
          failureUrl: mercadoPago.failureUrl || '',
          pendingUrl: mercadoPago.pendingUrl || '',
          webhookUrl: mercadoPago.webhookUrl || ''
        }));
      }

      if (monthlyPlan || yearlyPlan) {
        setPlansForm({
          monthlyAmount: String(monthlyPlan?.amount || '29.90'),
          yearlyAmount: String(yearlyPlan?.amount || '299.90'),
          currency: monthlyPlan?.currency || yearlyPlan?.currency || 'BRL',
          defaultProvider: monthlyPlan?.defaultProvider || yearlyPlan?.defaultProvider || 'STRIPE',
          allowProviderSelection: monthlyPlan?.allowProviderSelection ?? yearlyPlan?.allowProviderSelection ?? true
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao carregar configurações de pagamento.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
    loadEvents();
  }, [loadSettings, loadEvents]);

  async function handleSaveStripe() {
    try {
      setSaving(true);
      await updateStripeSettings({
        ...stripeForm,
        secretKey: stripeForm.secretKey.includes('********') ? undefined : stripeForm.secretKey,
        webhookSecret: stripeForm.webhookSecret.includes('********') ? undefined : stripeForm.webhookSecret
      });
      toast.success('Configuração do Stripe salva com sucesso.');
      await loadSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao salvar Stripe.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveMercadoPago() {
    try {
      setSaving(true);
      await updateMercadoPagoSettings({
        ...mercadoPagoForm,
        accessToken: mercadoPagoForm.accessToken.includes('********') ? undefined : mercadoPagoForm.accessToken,
        webhookSecret: mercadoPagoForm.webhookSecret.includes('********') ? undefined : mercadoPagoForm.webhookSecret
      });
      toast.success('Configuração do Mercado Pago salva com sucesso.');
      await loadSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao salvar Mercado Pago.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePlans() {
    try {
      setSaving(true);
      await updateBillingPlans({
        ...plansForm,
        monthlyAmount: Number(plansForm.monthlyAmount),
        yearlyAmount: Number(plansForm.yearlyAmount)
      });
      toast.success('Configuração dos planos salva com sucesso.');
      await loadSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao salvar planos.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(provider) {
    try {
      setTesting(provider);
      const result = provider === 'STRIPE' ? await testStripeSettings() : await testMercadoPagoSettings();
      toast.success(result.message || 'Conexão validada.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha no teste de conexão.');
    } finally {
      setTesting('');
    }
  }

  function renderStripeTab() {
    return (
      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Stripe</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">As chaves secretas serão criptografadas e não serão exibidas novamente.</p>
          </div>
          <Toggle value={stripeForm.enabled} onChange={(value) => setStripeForm((prev) => ({ ...prev, enabled: value }))} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Ambiente" value={stripeForm.environment} onChange={(event) => setStripeForm((prev) => ({ ...prev, environment: event.target.value }))}>
            <option value="SANDBOX">Sandbox</option>
            <option value="PRODUCTION">Produção</option>
          </Select>
          <Input label="Publishable Key" value={stripeForm.publicKey} onChange={(event) => setStripeForm((prev) => ({ ...prev, publicKey: event.target.value }))} />
          <Input label="Secret Key" value={stripeForm.secretKey} onChange={(event) => setStripeForm((prev) => ({ ...prev, secretKey: event.target.value }))} />
          <Input label="Webhook Secret" value={stripeForm.webhookSecret} onChange={(event) => setStripeForm((prev) => ({ ...prev, webhookSecret: event.target.value }))} />
          <Input label="Price ID mensal Premium" value={stripeForm.monthlyPlanExternalId} onChange={(event) => setStripeForm((prev) => ({ ...prev, monthlyPlanExternalId: event.target.value }))} />
          <Input label="Price ID anual Premium" value={stripeForm.yearlyPlanExternalId} onChange={(event) => setStripeForm((prev) => ({ ...prev, yearlyPlanExternalId: event.target.value }))} />
          <Input label="URL de sucesso" value={stripeForm.successUrl} onChange={(event) => setStripeForm((prev) => ({ ...prev, successUrl: event.target.value }))} />
          <Input label="URL de cancelamento" value={stripeForm.cancelUrl} onChange={(event) => setStripeForm((prev) => ({ ...prev, cancelUrl: event.target.value }))} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSaveStripe} disabled={saving}>Salvar</Button>
          <Button variant="secondary" onClick={() => handleTest('STRIPE')} disabled={testing === 'STRIPE'}>Testar conexão</Button>
        </div>
      </Card>
    );
  }

  function renderMercadoPagoTab() {
    return (
      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mercado Pago</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">As chaves secretas serão criptografadas e não serão exibidas novamente.</p>
          </div>
          <Toggle value={mercadoPagoForm.enabled} onChange={(value) => setMercadoPagoForm((prev) => ({ ...prev, enabled: value }))} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Ambiente" value={mercadoPagoForm.environment} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, environment: event.target.value }))}>
            <option value="SANDBOX">Sandbox</option>
            <option value="PRODUCTION">Produção</option>
          </Select>
          <Input label="Public Key" value={mercadoPagoForm.publicKey} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, publicKey: event.target.value }))} />
          <Input label="Access Token" value={mercadoPagoForm.accessToken} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, accessToken: event.target.value }))} />
          <Input label="Webhook Secret" value={mercadoPagoForm.webhookSecret} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, webhookSecret: event.target.value }))} />
          <Input label="Plano mensal Premium" value={mercadoPagoForm.monthlyPlanExternalId} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, monthlyPlanExternalId: event.target.value }))} />
          <Input label="Plano anual Premium" value={mercadoPagoForm.yearlyPlanExternalId} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, yearlyPlanExternalId: event.target.value }))} />
          <Input label="URL de sucesso" value={mercadoPagoForm.successUrl} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, successUrl: event.target.value }))} />
          <Input label="URL de falha" value={mercadoPagoForm.failureUrl} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, failureUrl: event.target.value }))} />
          <Input label="URL pendente" value={mercadoPagoForm.pendingUrl} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, pendingUrl: event.target.value }))} />
          <Input label="URL webhook" value={mercadoPagoForm.webhookUrl} onChange={(event) => setMercadoPagoForm((prev) => ({ ...prev, webhookUrl: event.target.value }))} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSaveMercadoPago} disabled={saving}>Salvar</Button>
          <Button variant="secondary" onClick={() => handleTest('MERCADO_PAGO')} disabled={testing === 'MERCADO_PAGO'}>Testar conexão</Button>
        </div>
      </Card>
    );
  }

  function renderPlansTab() {
    return (
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Planos Premium</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Controle os preços exibidos e o gateway padrão do checkout.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Valor mensal Premium" type="number" step="0.01" value={plansForm.monthlyAmount} onChange={(event) => setPlansForm((prev) => ({ ...prev, monthlyAmount: event.target.value }))} />
          <Input label="Valor anual Premium" type="number" step="0.01" value={plansForm.yearlyAmount} onChange={(event) => setPlansForm((prev) => ({ ...prev, yearlyAmount: event.target.value }))} />
          <Select label="Moeda" value={plansForm.currency} onChange={(event) => setPlansForm((prev) => ({ ...prev, currency: event.target.value }))}>
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
          </Select>
          <Select label="Gateway padrão" value={plansForm.defaultProvider} onChange={(event) => setPlansForm((prev) => ({ ...prev, defaultProvider: event.target.value }))}>
            <option value="STRIPE">Stripe</option>
            <option value="MERCADO_PAGO">Mercado Pago</option>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Permitir escolher gateway no checkout</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Se desativado, o checkout sempre usa o gateway padrão.</p>
          </div>
          <Toggle value={plansForm.allowProviderSelection} onChange={(value) => setPlansForm((prev) => ({ ...prev, allowProviderSelection: value }))} />
        </div>
        <Button onClick={handleSavePlans} disabled={saving}>Salvar</Button>
      </Card>
    );
  }

  function renderWebhooksTab() {
    async function copy(value) {
      await navigator.clipboard.writeText(value);
      toast.success('URL copiada.');
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <Webhook className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Stripe</h2>
          </div>
          <Input label="Webhook URL" value={webhookUrls.stripe} readOnly />
          <Button variant="secondary" onClick={() => copy(webhookUrls.stripe)}><Copy className="h-4 w-4" />Copiar URL</Button>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure estas URLs no painel do provedor.</p>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <Webhook className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mercado Pago</h2>
          </div>
          <Input label="Webhook URL" value={webhookUrls.mercadoPago} readOnly />
          <Button variant="secondary" onClick={() => copy(webhookUrls.mercadoPago)}><Copy className="h-4 w-4" />Copiar URL</Button>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure estas URLs no painel do provedor.</p>
        </Card>
      </div>
    );
  }

  function renderLogsTab() {
    return (
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Logs de Pagamento</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Últimos eventos recebidos pelos webhooks.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadEvents} disabled={eventsLoading}><RefreshCcw className="h-4 w-4" />Atualizar</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Gateway</th>
                <th className="px-3 py-2">Evento</th>
                <th className="px-3 py-2">Tenant</th>
                <th className="px-3 py-2">Processado</th>
                <th className="px-3 py-2">Erro</th>
              </tr>
            </thead>
            <tbody>
              {events.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-3">{new Date(item.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="px-3 py-3">{item.provider}</td>
                  <td className="px-3 py-3">{item.eventType}</td>
                  <td className="px-3 py-3">{item.tenant?.name || '-'}</td>
                  <td className="px-3 py-3">{item.processed ? 'Sim' : 'Não'}</td>
                  <td className="px-3 py-3">{item.errorMessage || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Configurações de Pagamento" description="Configure Stripe, Mercado Pago, preços do Premium e acompanhe eventos de assinatura." />

        <Card className="p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${activeTab === tab ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Card>

        {loading ? <Card>Carregando configurações...</Card> : null}
        {!loading && activeTab === 'Stripe' ? renderStripeTab() : null}
        {!loading && activeTab === 'Mercado Pago' ? renderMercadoPagoTab() : null}
        {!loading && activeTab === 'Planos' ? renderPlansTab() : null}
        {!loading && activeTab === 'Webhooks' ? renderWebhooksTab() : null}
        {!loading && activeTab === 'Logs' ? renderLogsTab() : null}
      </div>
    </AdminLayout>
  );
}

export default PaymentSettingsPage;
