import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Users } from 'lucide-react';

import AdminLayout from '../../layouts/admin/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';
import { blockUser, listUsers, unblockUser } from '../../services/adminService';
import { formatDateBR } from '../../utils/formatters';

const INITIAL_FILTERS = {
  search: '',
  status: '',
  globalRole: ''
};

const INITIAL_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'BLOCKED', label: 'Bloqueado' }
];

const ROLE_OPTIONS = [
  { value: '', label: 'Todos os perfis' },
  { value: 'USER', label: 'Usuário' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' }
];

const STATUS_BADGE = {
  ACTIVE: { variant: 'success', label: 'Ativo' },
  INACTIVE: { variant: 'warning', label: 'Inativo' },
  BLOCKED: { variant: 'danger', label: 'Bloqueado' }
};

function buildParams(filters, page) {
  const params = { page, limit: 20 };

  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.globalRole) params.globalRole = filters.globalRole;

  return params;
}

function AdminUsers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const hasInitializedFromUrl = useRef(false);

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    globalRole: searchParams.get('globalRole') || ''
  }));
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, user: null, action: '' });

  const loadUsers = useCallback(async (currentFilters, currentPage) => {
    try {
      setLoading(true);
      setError('');

      const data = await listUsers(buildParams(currentFilters, currentPage));

      setUsers(data.data);
      setPagination(data.pagination);
      setPage(data.pagination.page);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : requestError.response?.data?.message || 'Não foi possível carregar os usuários.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(filters, page);
  }, []);

  function updateUrl(nextFilters, nextPage) {
    const params = {};
    if (nextFilters.search) params.search = nextFilters.search;
    if (nextFilters.status) params.status = nextFilters.status;
    if (nextFilters.globalRole) params.globalRole = nextFilters.globalRole;
    if (nextPage > 1) params.page = String(nextPage);
    setSearchParams(params, { replace: true });
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function applyFilters() {
    const nextPage = 1;
    setPage(nextPage);
    updateUrl(filters, nextPage);
    await loadUsers(filters, nextPage);
  }

  useEffect(() => {
    if (!hasInitializedFromUrl.current) {
      hasInitializedFromUrl.current = true;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      applyFilters();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters.search, filters.status, filters.globalRole]);

  async function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;

    setPage(nextPage);
    updateUrl(filters, nextPage);
    await loadUsers(filters, nextPage);
  }

  function handleViewDetails(user) {
    navigate(`/admin/users/${user.id}`);
  }

  function openConfirmModal(user, action) {
    setConfirmModal({ isOpen: true, user, action });
  }

  function closeConfirmModal() {
    setConfirmModal({ isOpen: false, user: null, action: '' });
  }

  async function handleConfirmAction() {
    const { user, action } = confirmModal;
    if (!user || !action) return;

    try {
      setActionLoading(true);

      if (action === 'block') {
        await blockUser(user.id);
        toast.success(`Usuário ${user.name} bloqueado com sucesso.`);
      } else {
        await unblockUser(user.id);
        toast.success(`Usuário ${user.name} desbloqueado com sucesso.`);
      }

      closeConfirmModal();
      await loadUsers(filters, page);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Falha ao executar a ação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                label="Buscar"
                name="search"
                placeholder="Nome ou email..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-44">
              <Select
                label="Perfil global"
                name="globalRole"
                value={filters.globalRole}
                onChange={handleFilterChange}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
            <div className="flex-shrink-0">
              <Button onClick={applyFilters} disabled={loading}>
                <Search className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <LoadingSkeleton key={item} className="h-16 rounded-[28px]" />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <Card className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20">
            <div className="flex items-center gap-3">
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => loadUsers(filters, page)}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : null}

        {!loading && !error && users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum usuário encontrado"
            description="Não há usuários cadastrados ou nenhum corresponde aos filtros aplicados."
          />
        ) : null}

        {!loading && !error && users.length > 0 ? (
          <>
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Nome</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Perfil global</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Tenants</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Criado em</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {users.map((user) => {
                    const statusInfo = STATUS_BADGE[user.status] || { variant: 'neutral', label: user.status };

                    return (
                      <tr key={user.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          {user.globalRole === 'SUPER_ADMIN' ? (
                            <Badge variant="warning">{'\u26A1'} Super Admin</Badge>
                          ) : (
                            <Badge variant="neutral">Usuário</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user._count?.memberships ?? user.tenantCount ?? '-'}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDateBR(user.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={() => handleViewDetails(user)}>
                              Ver detalhes
                            </Button>
                            {user.status === 'BLOCKED' ? (
                              <Button variant="secondary" size="sm" onClick={() => openConfirmModal(user, 'unblock')}>
                                Desbloquear
                              </Button>
                            ) : (
                              <Button variant="danger" size="sm" onClick={() => openConfirmModal(user, 'block')}>
                                Bloquear
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>

            <div className="flex items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} usuários)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={loading || page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={loading || page >= pagination.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        ) : null}

        <Modal
          isOpen={confirmModal.isOpen}
          title={confirmModal.action === 'block' ? 'Bloquear usuário' : 'Desbloquear usuário'}
          onClose={closeConfirmModal}
        >
          <div className="space-y-6">
            {confirmModal.action === 'block' ? (
              <p className="text-slate-600 dark:text-slate-400">
                Tem certeza que deseja <strong className="text-slate-900 dark:text-slate-100">bloquear</strong> o usuário{' '}
                <strong className="text-slate-900 dark:text-slate-100">{confirmModal.user?.name}</strong>?{' '}
                O usuário não poderá acessar a plataforma enquanto estiver bloqueado.
              </p>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                Tem certeza que deseja <strong className="text-slate-900 dark:text-slate-100">desbloquear</strong> o usuário{' '}
                <strong className="text-slate-900 dark:text-slate-100">{confirmModal.user?.name}</strong>?{' '}
                O usuário poderá acessar a plataforma normalmente.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeConfirmModal} disabled={actionLoading}>
                Cancelar
              </Button>
              <Button
                variant={confirmModal.action === 'block' ? 'danger' : 'primary'}
                onClick={handleConfirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processando...' : confirmModal.action === 'block' ? 'Sim, bloquear' : 'Sim, desbloquear'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;
