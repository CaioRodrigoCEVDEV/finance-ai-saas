import { Info, Loader2, Save, Settings, Bell, Palette } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import PageHeader from '../components/ui/PageHeader';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useTheme } from '../contexts/ThemeContext';
import * as settingsService from '../services/settingsService';
import { getAccounts } from '../services/accountService';
import { getCategories } from '../services/categoryService';

const CURRENCY_OPTIONS = [
  { value: 'BRL', label: 'BRL - Real brasileiro' },
  { value: 'USD', label: 'USD - Dólar americano' },
  { value: 'EUR', label: 'EUR - Euro' }
];

const THEME_OPTIONS = [
  { value: 'system', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' }
];

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
];

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className="h-5 w-5 rounded-lg border-2 border-slate-300 bg-white transition-all peer-checked:border-emerald-600 peer-checked:bg-emerald-600 dark:border-slate-600 dark:bg-slate-700 dark:peer-checked:border-emerald-500 dark:peer-checked:bg-emerald-500" />
      </div>
      <div>
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span> : null}
      </div>
    </label>
  );
}

function SettingsPage() {
  const { theme: currentTheme, setTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [currency, setCurrency] = useState('BRL');
  const [financialMonthStartDay, setFinancialMonthStartDay] = useState(1);
  const [defaultAccountId, setDefaultAccountId] = useState('');
  const [defaultExpenseCategoryId, setDefaultExpenseCategoryId] = useState('');
  const [theme, setThemeLocal] = useState('system');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [notifications, setNotifications] = useState({
    budgetWarning: true,
    budgetExceeded: true,
    invoiceDue: true,
    goalBehind: false
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');

      const [settingsData, accountsData, categoriesData] = await Promise.all([
        settingsService.getSettings(),
        getAccounts(),
        getCategories({ includeInactive: false })
      ]);

      setAccounts(accountsData);

      const expenseCategories = (categoriesData || []).filter(
        (c) => c.type === 'EXPENSE' || c.type === 'Despesa'
      );
      setCategories(expenseCategories.length > 0 ? expenseCategories : categoriesData);

      setCurrency(settingsData.currency || 'BRL');
      setFinancialMonthStartDay(settingsData.financialMonthStartDay || 1);
      setDefaultAccountId(settingsData.defaultAccountId || '');
      setDefaultExpenseCategoryId(settingsData.defaultExpenseCategoryId || '');
      setThemeLocal(settingsData.theme || 'system');
      setDateFormat(settingsData.dateFormat || 'DD/MM/YYYY');

      if (settingsData.notifications) {
        setNotifications({
          budgetWarning: settingsData.notifications.budgetWarning ?? true,
          budgetExceeded: settingsData.notifications.budgetExceeded ?? true,
          invoiceDue: settingsData.notifications.invoiceDue ?? true,
          goalBehind: settingsData.notifications.goalBehind ?? false
        });
      }
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Erro ao carregar configuracoes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);

      await settingsService.updateSettings({
        currency,
        financialMonthStartDay,
        defaultAccountId: defaultAccountId || null,
        defaultExpenseCategoryId: defaultExpenseCategoryId || null,
        theme,
        dateFormat,
        notifications
      });

      setSuccess('Configurações salvas com sucesso');

      if (theme !== currentTheme) {
        setTheme(theme);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar configuracoes');
    } finally {
      setSaving(false);
    }
  }, [currency, financialMonthStartDay, defaultAccountId, defaultExpenseCategoryId, theme, dateFormat, notifications, currentTheme, setTheme]);

  const handleNotificationChange = useCallback((key) => (event) => {
    setNotifications((prev) => ({ ...prev, [key]: event.target.checked }));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Configurações" description="Personalize suas preferências financeiras, aparência e alertas." />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Card>
              <LoadingSkeleton className="h-5 w-48" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
            </Card>
            <Card>
              <LoadingSkeleton className="h-5 w-40" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
            </Card>
            <Card>
              <LoadingSkeleton className="h-5 w-36" />
              <LoadingSkeleton className="mt-4 h-8 w-64" />
              <LoadingSkeleton className="mt-4 h-8 w-64" />
              <LoadingSkeleton className="mt-4 h-8 w-56" />
              <LoadingSkeleton className="mt-4 h-8 w-48" />
            </Card>
          </div>
          <div>
            <Card>
              <LoadingSkeleton className="h-5 w-40" />
              <LoadingSkeleton className="mt-4 h-8 w-56" />
              <LoadingSkeleton className="mt-4 h-8 w-48" />
              <LoadingSkeleton className="mt-4 h-8 w-44" />
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (fetchError) {
    return (
      <AppLayout>
        <PageHeader title="Configurações" description="Personalize suas preferências financeiras, aparência e alertas." />
        <Card className="mt-6 border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-medium text-rose-800 dark:text-rose-300">Erro ao carregar configurações</p>
              <p className="mt-1 text-sm text-rose-700 dark:text-rose-400">{fetchError}</p>
              <Button variant="secondary" size="sm" className="mt-3" onClick={fetchData}>Tentar novamente</Button>
            </div>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Configurações" description="Personalize suas preferências financeiras, aparência e alertas." />

      <form onSubmit={handleSubmit}>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Card>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Preferências financeiras</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Configure moeda, contas e categorias padrão</p>
                </div>
              </div>

              <div className="space-y-4">
                <Select
                  label="Moeda padrão"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {CURRENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Dia inicial do mês financeiro</span>
                  <select
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                    value={financialMonthStartDay}
                    onChange={(e) => setFinancialMonthStartDay(Number(e.target.value))}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>Dia {day}</option>
                    ))}
                  </select>
                  <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">
                    Use esta opção caso seu mês financeiro comece no dia do pagamento.
                  </span>
                </label>

                <Select
                  label="Conta padrão para lançamentos"
                  value={defaultAccountId}
                  onChange={(e) => setDefaultAccountId(e.target.value)}
                >
                  <option value="">Nenhuma conta padrão</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </Select>

                <Select
                  label="Categoria padrão para despesas sem categoria"
                  value={defaultExpenseCategoryId}
                  onChange={(e) => setDefaultExpenseCategoryId(e.target.value)}
                >
                  <option value="">Nenhuma categoria padrão</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </Select>
              </div>
            </Card>

            <Card>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Aparência e formato</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Personalize o visual e datas</p>
                </div>
              </div>

              <div className="space-y-4">
                <Select
                  label="Tema"
                  value={theme}
                  onChange={(e) => setThemeLocal(e.target.value)}
                >
                  {THEME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>

                <Select
                  label="Formato de data"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  {DATE_FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>
            </Card>

            <Card>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notificações</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Escolha quais alertas deseja receber</p>
                </div>
              </div>

              <div className="space-y-5">
                <Toggle
                  label="Orçamento próximo do limite"
                  description="Avise quando um orçamento atingir 80% do valor planejado"
                  checked={notifications.budgetWarning}
                  onChange={handleNotificationChange('budgetWarning')}
                />
                <Toggle
                  label="Orçamento excedido"
                  description="Avise quando um orçamento ultrapassar o valor planejado"
                  checked={notifications.budgetExceeded}
                  onChange={handleNotificationChange('budgetExceeded')}
                />
                <Toggle
                  label="Vencimento de fatura"
                  description="Avise sobre faturas de cartão de crédito próximas do vencimento"
                  checked={notifications.invoiceDue}
                  onChange={handleNotificationChange('invoiceDue')}
                />
                <Toggle
                  label="Meta atrasada"
                  description="Avise quando uma meta financeira estiver com o prazo vencido"
                  checked={notifications.goalBehind}
                  onChange={handleNotificationChange('goalBehind')}
                />
              </div>
            </Card>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                {success}
              </div>
            ) : null}

            <Button type="submit" disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar configurações
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sobre estas configurações</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Essas preferências são aplicadas ao workspace atual e ajudam o Finance AI a adaptar relatórios, lançamentos e alertas ao seu uso.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}

export default SettingsPage;
