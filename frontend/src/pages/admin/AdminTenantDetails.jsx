import { ArrowLeft, BadgeDollarSign, Building2, CreditCard, Loader2, Lock, Receipt, Target, Unlock, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AdminLayout from '../../layouts/admin/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';
import { getTenant, reactivateTenant, suspendTenant, updateTenant } from '../../services/adminService';
import { formatDateBR } from '../../utils/formatters';

const PLAN_CONFIG = {
  PREMIUM: { label: 'Premium', variant: 'info' },
  PRO: { label: 'Pro', variant: 'success' },
  FREE: { label: 'Free', variant: 'neutral' },
  FAMILY: { label: 'Família', variant: 'secondary' }
};

const STATUS_CONFIG = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  INACTIVE: { label: 'Inativo', variant: 'warning' },
  BLOCKED: { label: 'Bloqueado', variant: 'danger' }
};

const ROLE_CONFIG = {
  OWNER: { label: 'Proprietário', variant: 'info' },
  ADMIN: { label: 'Admin', variant: 'success' },
  MEMBER: { label: 'Membro', variant: 'neutral' },
  READONLY: { label: 'Leitura', variant: 'secondary' }
};

const PLAN_OPTIONS = [
  { value: 'FREE', label: 'Free' },
  { value: 'PRO', label: 'Pro' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'FAMILY', label: 'Família' }
];

function PlanBadge({ plan }) {
  const config = PLAN_CONFIG[plan] || { label: plan || '--', variant: 'neutral' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status || '--', variant: 'neutral' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || { label: role || '--', variant: 'neutral' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function UserStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status || '--', variant: 'neutral' };
  return <Badge variant={config.variant} className="text-[11px]">{config.label}</Badge>;
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, variant, loading, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <div className="space-y-6">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={variant || 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DetailsSkeleton() {
  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <LoadingSkeleton className="h-10 w-40 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><LoadingSkeleton className="h-48 rounded-2xl" /></Card>
          <Card><LoadingSkeleton className="h-48 rounded-2xl" /></Card>
          <Card className="lg:col-span-2"><LoadingSkeleton className="h-64 rounded-2xl" /></Card>
          <Card className="lg:col-span-2"><LoadingSkeleton className="h-48 rounded-2xl" /></Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function ErrorState({ message, onBack }) {
  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Voltar para tenants
        </Button>
        <Card className="border-rose-200 bg-rose-50 p-8 dark:border-rose-800 dark:bg-rose-900/20">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-800 dark:text-rose-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Falha ao carregar dados</p>
              <p className="mt-2 text-sm text-rose-700 dark:text-rose-400">{message}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

function AdminTenantDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [planModal, setPlanModal] = useState({ isOpen: false, selectedPlan: '' });
  const [nameModal, setNameModal] = useState({ isOpen: false, name: '' });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'primary',
    action: null
  });

  const loadTenant = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTenant(id);
      setTenant(data.tenant || data);
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'Erro ao carregar dados do workspace.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  function handleBack() {
    navigate('/admin/tenants');
  }

  function handleOpenPlanModal() {
    setPlanModal({ isOpen: true, selectedPlan: tenant?.plan || '' });
  }

  async function handleUpdatePlan() {
    if (!planModal.selectedPlan || planModal.selectedPlan === tenant?.plan) {
      setPlanModal({ isOpen: false, selectedPlan: '' });
      return;
    }

    setActionLoading(true);
    try {
      await updateTenant(id, { plan: planModal.selectedPlan });
      toast.success('Plano alterado com sucesso.');
      setPlanModal({ isOpen: false, selectedPlan: '' });
      loadTenant();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao alterar plano.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenNameModal() {
    setNameModal({ isOpen: true, name: tenant?.name || '' });
  }

  async function handleUpdateName() {
    const trimmed = nameModal.name.trim();
    if (!trimmed || trimmed === tenant?.name) {
      setNameModal({ isOpen: false, name: '' });
      return;
    }

    setActionLoading(true);
    try {
      await updateTenant(id, { name: trimmed });
      toast.success('Nome alterado com sucesso.');
      setNameModal({ isOpen: false, name: '' });
      loadTenant();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao alterar nome.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleSuspendClick() {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar suspensão',
      message: `Tem certeza que deseja suspender o workspace "${tenant?.name}"? Os usuários desse workspace não poderão acessar o sistema enquanto estiver suspenso.`,
      variant: 'danger',
      action: handleSuspendConfirm
    });
  }

  async function handleSuspendConfirm() {
    setActionLoading(true);
    try {
      await suspendTenant(id);
      toast.success('Workspace suspenso com sucesso.');
      setConfirmModal({ isOpen: false, title: '', message: '', variant: 'primary', action: null });
      loadTenant();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao suspender workspace.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleReactivateClick() {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar reativação',
      message: `Tem certeza que deseja reativar o workspace "${tenant?.name}"? Os usuários poderão acessar o sistema novamente.`,
      variant: 'primary',
      action: handleReactivateConfirm
    });
  }

  async function handleReactivateConfirm() {
    setActionLoading(true);
    try {
      await reactivateTenant(id);
      toast.success('Workspace reativado com sucesso.');
      setConfirmModal({ isOpen: false, title: '', message: '', variant: 'primary', action: null });
      loadTenant();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao reativar workspace.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error && !tenant) {
    return <ErrorState message={error} onBack={handleBack} />;
  }

  const usage = tenant?.usage || {};
  const users = tenant?.users || [];
  const isSuspended = tenant?.status === 'INACTIVE' || tenant?.status === 'BLOCKED';

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para tenants
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleOpenNameModal} disabled={actionLoading}>
              Alterar Nome
            </Button>
            <Button variant="secondary" size="sm" onClick={handleOpenPlanModal} disabled={actionLoading}>
              <BadgeDollarSign className="h-4 w-4" />
              Alterar Plano
            </Button>
            {isSuspended ? (
              <Button variant="primary" size="sm" onClick={handleReactivateClick} disabled={actionLoading}>
                <Unlock className="h-4 w-4" />
                Reativar
              </Button>
            ) : (
              <Button variant="danger" size="sm" onClick={handleSuspendClick} disabled={actionLoading}>
                <Lock className="h-4 w-4" />
                Suspender
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <SectionHeader icon={Building2} title="Informações do Workspace" />
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Nome</dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tenant?.name || '--'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Email</dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">{tenant?.email || '--'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Plano</dt>
                <dd><PlanBadge plan={tenant?.plan} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                <dd><StatusBadge status={tenant?.status} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Criado em</dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">{formatDateBR(tenant?.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-slate-500 dark:text-slate-400">Atualizado em</dt>
                <dd className="text-sm text-slate-900 dark:text-slate-100">{formatDateBR(tenant?.updatedAt)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <SectionHeader icon={Users} title="Proprietário" />
            {tenant?.owner ? (
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Nome</dt>
                  <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tenant.owner.name || '--'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Email</dt>
                  <dd className="text-sm text-slate-900 dark:text-slate-100">{tenant.owner.email || '--'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Role Global</dt>
                  <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">{tenant.owner.globalRole || '--'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Status</dt>
                  <dd><UserStatusBadge status={tenant.owner.status} /></dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Proprietário não encontrado.</p>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <SectionHeader icon={Target} title="Resumo de Uso" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Target className="h-4 w-4" />
                  Contas
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{usage.accountsCount ?? '--'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <CreditCard className="h-4 w-4" />
                  Cartões
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{usage.creditCardsCount ?? '--'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Receipt className="h-4 w-4" />
                  Transações
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{usage.transactionsCount ?? '--'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Target className="h-4 w-4" />
                  Orçamentos
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{usage.budgetsCount ?? '--'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <BadgeDollarSign className="h-4 w-4" />
                  Metas
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{usage.goalsCount ?? '--'}</p>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <SectionHeader icon={Users} title={`Usuários (${users.length})`} />
            {users.length === 0 ? (
              <p className="py-4 text-sm text-slate-500 dark:text-slate-400">Nenhum usuário vinculado a este workspace.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Nome</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Email</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Papel</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr
                        key={user.id || i}
                        className={`border-b border-slate-100 last:border-b-0 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${i % 2 !== 0 ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
                      >
                        <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">{user.name || '--'}</td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{user.email || '--'}</td>
                        <td className="px-3 py-3">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-3 py-3">
                          <UserStatusBadge status={user.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal isOpen={planModal.isOpen} title="Alterar Plano" onClose={() => setPlanModal({ isOpen: false, selectedPlan: '' })}>
        <div className="space-y-6">
          <Select
            label="Selecione o novo plano"
            value={planModal.selectedPlan}
            onChange={(e) => setPlanModal({ ...planModal, selectedPlan: e.target.value })}
          >
            {PLAN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPlanModal({ isOpen: false, selectedPlan: '' })} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleUpdatePlan} disabled={actionLoading || !planModal.selectedPlan || planModal.selectedPlan === tenant?.plan}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={nameModal.isOpen} title="Alterar Nome" onClose={() => setNameModal({ isOpen: false, name: '' })}>
        <div className="space-y-6">
          <Input
            label="Nome do workspace"
            value={nameModal.name}
            onChange={(e) => setNameModal({ ...nameModal, name: e.target.value })}
            placeholder="Digite o novo nome"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setNameModal({ isOpen: false, name: '' })} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleUpdateName} disabled={actionLoading || !nameModal.name.trim() || nameModal.name.trim() === tenant?.name}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        loading={actionLoading}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', variant: 'primary', action: null })}
      />
    </AdminLayout>
  );
}

export default AdminTenantDetails;
