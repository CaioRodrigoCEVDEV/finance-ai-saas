import { useCallback, useEffect, useState } from 'react';
import { Check, Crown, Save, X } from 'lucide-react';

import AdminLayout from '../../layouts/admin/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import { listPlanLimits, updatePlanLimit } from '../../services/adminService';

const PLAN_CONFIG = {
  FREE: { label: 'FREE', badgeVariant: 'neutral' },
  PRO: { label: 'PRO', badgeVariant: 'success' },
  PREMIUM: { label: 'PREMIUM', badgeVariant: 'info' },
  FAMILY: { label: 'FAMILY', badgeVariant: 'secondary' }
};

const LIMIT_FIELDS = [
  { key: 'maxAccounts', label: 'Contas' },
  { key: 'maxCreditCards', label: 'Cartões de crédito' },
  { key: 'maxUsers', label: 'Usuários' },
  { key: 'maxTransactionsPerMonth', label: 'Transações por mês' }
];

const BOOLEAN_FIELDS = [
  { key: 'canImport', label: 'Importar arquivos' },
  { key: 'canExportReports', label: 'Exportar relatórios' },
  { key: 'canUseAi', label: 'Usar IA' },
  { key: 'canUseOpenFinance', label: 'Open Finance' }
];

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
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function LimitValue({ limit }) {
  if (limit === 0 || limit === null || limit === undefined) {
    return <span className="text-sm text-slate-400 dark:text-slate-500">ilimitado</span>;
  }
  return <span className="text-sm text-slate-600 dark:text-slate-400">{limit}</span>;
}

function AdminPlans() {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [editModal, setEditModal] = useState({
    isOpen: false,
    plan: null,
    form: {}
  });

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listPlanLimits();
      setPlans(Array.isArray(data) ? data : data.plans || data.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Não foi possível carregar os limites dos planos.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  function openEditModal(plan) {
    setEditModal({
      isOpen: true,
      plan: plan.plan,
      form: {
        maxAccounts: plan.maxAccounts ?? 0,
        maxCreditCards: plan.maxCreditCards ?? 0,
        maxUsers: plan.maxUsers ?? 0,
        maxTransactionsPerMonth: plan.maxTransactionsPerMonth ?? 0,
        canImport: plan.canImport ?? false,
        canExportReports: plan.canExportReports ?? false,
        canUseAi: plan.canUseAi ?? false,
        canUseOpenFinance: plan.canUseOpenFinance ?? false
      }
    });
  }

  function closeEditModal() {
    setEditModal({ isOpen: false, plan: null, form: {} });
  }

  function handleFormChange(key, value) {
    setEditModal((prev) => ({
      ...prev,
      form: { ...prev.form, [key]: value }
    }));
  }

  async function handleSave() {
    const { plan, form } = editModal;
    if (!plan) return;

    const payload = {
      maxAccounts: form.maxAccounts,
      maxCreditCards: form.maxCreditCards,
      maxUsers: form.maxUsers,
      maxTransactionsPerMonth: form.maxTransactionsPerMonth,
      canImport: form.canImport,
      canExportReports: form.canExportReports,
      canUseAi: form.canUseAi,
      canUseOpenFinance: form.canUseOpenFinance
    };

    try {
      setSaving(true);
      await updatePlanLimit(plan, payload);
      toast.success(`Limites do plano ${plan} atualizados com sucesso.`);
      closeEditModal();
      await loadPlans();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Falha ao atualizar os limites do plano.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Limites dos Planos</h1>
          </div>
        </Card>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <LoadingSkeleton key={item} className="h-80 rounded-[28px]" />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <Card className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20">
            <div className="flex items-center gap-3">
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
              <Button variant="secondary" size="sm" onClick={loadPlans}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : null}

        {!loading && !error ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {plans.map((plan) => {
              const config = PLAN_CONFIG[plan.plan] || { label: plan.plan, badgeVariant: 'neutral' };

              return (
                <Card key={plan.plan}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{config.label}</h2>
                      <Badge variant={config.badgeVariant}>{config.label}</Badge>
                    </div>

                    <div className="space-y-2">
                      {LIMIT_FIELDS.map((field) => (
                        <div key={field.key} className="flex items-center justify-between">
                          <span className="text-sm text-slate-500 dark:text-slate-400">{field.label}</span>
                          <LimitValue limit={plan[field.key]} />
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Permissões</p>
                      <div className="space-y-2">
                        {BOOLEAN_FIELDS.map((field) => (
                          <div key={field.key} className="flex items-center gap-2">
                            {plan[field.key] ? (
                              <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                            ) : (
                              <X className="h-4 w-4 flex-shrink-0 text-rose-400" />
                            )}
                            <span className="text-sm text-slate-600 dark:text-slate-400">{field.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => openEditModal(plan)}>
                        Editar
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}

        <Modal
          isOpen={editModal.isOpen}
          title={editModal.plan ? `Editar limites - ${editModal.plan}` : 'Editar limites'}
          onClose={closeEditModal}
        >
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {LIMIT_FIELDS.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  type="number"
                  min="0"
                  value={editModal.form[field.key] ?? 0}
                  onChange={(e) => handleFormChange(field.key, Number(e.target.value))}
                />
              ))}
            </div>

            <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
              <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Permissões</p>
              <div className="space-y-3">
                {BOOLEAN_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{field.label}</span>
                    <Toggle
                      value={editModal.form[field.key] ?? false}
                      onChange={(val) => handleFormChange(field.key, val)}
                      disabled={saving}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={closeEditModal} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default AdminPlans;
