import { Building2, ChevronLeft, ChevronRight, Eye, Loader2, Lock, Search, SlidersHorizontal, Unlock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AdminLayout from '../../layouts/admin/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';
import { listTenants, reactivateTenant, suspendTenant } from '../../services/adminService';
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

const PLAN_OPTIONS = [
  { value: '', label: 'Todos os planos' },
  { value: 'FREE', label: 'Free' },
  { value: 'PRO', label: 'Pro' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'FAMILY', label: 'Família' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'BLOCKED', label: 'Bloqueado' }
];

function ConfirmModal({ isOpen, title, message, loading, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <div className="space-y-6">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={title === 'Confirmar suspensão' ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function FilterBar({ filters, onChange, onClear }) {
  const hasFilters = filters.search || filters.plan || filters.status;

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="flex-1"
          />
        </div>

        <Select
          value={filters.plan}
          onChange={(e) => onChange({ ...filters, plan: e.target.value })}
          className="w-44"
        >
          {PLAN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>

        <Select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="w-44"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>

        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <SlidersHorizontal className="h-4 w-4" />
            Limpar
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function PlanBadge({ plan }) {
  const config = PLAN_CONFIG[plan] || { label: plan || '--', variant: 'neutral' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status || '--', variant: 'neutral' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function TableSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Nome</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Plano</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Proprietário</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Usuários</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Criado em</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
                <td className="px-5 py-4"><LoadingSkeleton className="h-5 w-32 rounded-lg" /></td>
                <td className="px-5 py-4"><LoadingSkeleton className="h-5 w-16 rounded-lg" /></td>
                <td className="px-5 py-4"><LoadingSkeleton className="h-5 w-20 rounded-lg" /></td>
                <td className="px-5 py-4"><LoadingSkeleton className="h-5 w-44 rounded-lg" /></td>
                <td className="px-5 py-4"><LoadingSkeleton className="h-5 w-10 rounded-lg" /></td>
                <td className="px-5 py-4"><LoadingSkeleton className="h-5 w-24 rounded-lg" /></td>
                <td className="px-5 py-4"><LoadingSkeleton className="h-8 w-20 rounded-lg" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TenantsTable({ tenants, onView, onSuspend, onReactivate }) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 p-0 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Nome</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Plano</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Proprietário</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Usuários</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Criado em</th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, i) => (
              <tr
                key={tenant.id}
                className={`border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${i % 2 !== 0 ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tenant.name}</p>
                </td>
                <td className="px-5 py-4">
                  <PlanBadge plan={tenant.plan} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={tenant.status} />
                </td>
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{tenant.owner?.name || '--'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.owner?.email || '--'}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{tenant.usersCount ?? '--'}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{formatDateBR(tenant.createdAt)}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(tenant.id)}
                      aria-label="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {tenant.status === 'ACTIVE' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSuspend(tenant)}
                        aria-label="Suspender"
                      >
                        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReactivate(tenant)}
                        aria-label="Reativar"
                      >
                        <Unlock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Pagination({ page, totalPages, total, loading, onPrev, onNext }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Página {page} de {Math.max(totalPages, 1)} &bull; {total} registro{total !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onPrev}
          disabled={loading || page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onNext}
          disabled={loading || page >= totalPages}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AdminTenants() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [tenants, setTenants] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    plan: searchParams.get('plan') || '',
    status: searchParams.get('status') || ''
  });

  const page = Number(searchParams.get('page')) || 1;

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null
  });

  const loadTenants = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.search) params.search = filters.search;
      if (filters.plan) params.plan = filters.plan;
      if (filters.status) params.status = filters.status;

      const data = await listTenants(params);
      setTenants(data.tenants || data.data || []);
      setPagination(data.pagination || { page, totalPages: 0, total: 0 });
    } catch {
      toast.error('Erro ao carregar tenants. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [page, filters.search, filters.plan, filters.status]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  function updateSearchParams(updates) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });
    setSearchParams(next, { replace: true });
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.plan) params.set('plan', newFilters.plan);
    if (newFilters.status) params.set('status', newFilters.status);
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  }

  function handleClearFilters() {
    const cleared = { search: '', plan: '', status: '' };
    setFilters(cleared);
    setSearchParams({ page: '1' }, { replace: true });
  }

  function handleView(id) {
    navigate(`/admin/tenants/${id}`);
  }

  function handleSuspendClick(tenant) {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar suspensão',
      message: `Tem certeza que deseja suspender o workspace "${tenant.name}"? Os usuários desse workspace não poderão acessar o sistema enquanto estiver suspenso.`,
      action: () => handleSuspendConfirm(tenant.id)
    });
  }

  async function handleSuspendConfirm(id) {
    setActionLoading(true);
    try {
      await suspendTenant(id);
      toast.success('Workspace suspenso com sucesso.');
      setConfirmModal({ isOpen: false, title: '', message: '', action: null });
      loadTenants();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao suspender workspace.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleReactivateClick(tenant) {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar reativação',
      message: `Tem certeza que deseja reativar o workspace "${tenant.name}"? Os usuários poderão acessar o sistema novamente.`,
      action: () => handleReactivateConfirm(tenant.id)
    });
  }

  async function handleReactivateConfirm(id) {
    setActionLoading(true);
    try {
      await reactivateTenant(id);
      toast.success('Workspace reativado com sucesso.');
      setConfirmModal({ isOpen: false, title: '', message: '', action: null });
      loadTenants();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao reativar workspace.');
    } finally {
      setActionLoading(false);
    }
  }

  function handlePrevPage() {
    if (page > 1) {
      updateSearchParams({ page: String(page - 1) });
    }
  }

  function handleNextPage() {
    if (page < pagination.totalPages) {
      updateSearchParams({ page: String(page + 1) });
    }
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Tenants / Workspaces"
        description="Gerencie todos os workspaces da plataforma."
      />

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {loading ? (
        <TableSkeleton />
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhum workspace encontrado"
          description={filters.search || filters.plan || filters.status ? 'Tente ajustar os filtros para ver mais resultados.' : 'Nenhum workspace cadastrado na plataforma.'}
        />
      ) : (
        <>
          <TenantsTable
            tenants={tenants}
            onView={handleView}
            onSuspend={handleSuspendClick}
            onReactivate={handleReactivateClick}
          />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            loading={loading}
            onPrev={handlePrevPage}
            onNext={handleNextPage}
          />
        </>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={actionLoading}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', action: null })}
      />
    </AdminLayout>
  );
}

export default AdminTenants;
