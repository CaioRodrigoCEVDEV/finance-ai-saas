import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScrollText, Search } from 'lucide-react';

import AdminLayout from '../../layouts/admin/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Select from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';
import { listAuditLogs } from '../../services/adminService';
import { formatDateBR } from '../../utils/formatters';

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'Todas as entidades' },
  { value: 'user', label: 'Usuário' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'plan_limit', label: 'Plano' },
  { value: 'feedback', label: 'Feedback' }
];

function getActionBadgeVariant(action) {
  if (!action) return 'neutral';
  if (action.startsWith('ADMIN_UPDATE_')) return 'warning';
  if (action.startsWith('ADMIN_SUSPEND_')) return 'danger';
  if (action.startsWith('ADMIN_REACTIVATE_')) return 'success';
  if (action.startsWith('ADMIN_BLOCK_')) return 'danger';
  if (action.startsWith('ADMIN_UNBLOCK_')) return 'success';
  if (action.startsWith('ADMIN_RESET_')) return 'info';
  return 'neutral';
}

function formatActionLabel(action) {
  if (!action) return '--';
  return action
    .replace(/^ADMIN_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}

function buildParams(filters, page) {
  const params = { page, limit: 20 };
  if (filters.search) params.search = filters.search;
  if (filters.entityType) params.entityType = filters.entityType;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  return params;
}

function AdminAuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const hasInitializedFromUrl = useRef(false);

  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    entityType: searchParams.get('entityType') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || ''
  }));
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async (currentFilters, currentPage) => {
    try {
      setLoading(true);
      setError('');

      const data = await listAuditLogs(buildParams(currentFilters, currentPage));

      setLogs(data.data || data.logs || []);
      setPagination(data.pagination || { page: currentPage, limit: 20, total: 0, totalPages: 1 });
      setPage(data.pagination?.page ?? currentPage);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : requestError.response?.data?.message || 'Não foi possível carregar os logs de auditoria.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs(filters, page);
  }, []);

  function updateUrl(nextFilters, nextPage) {
    const params = {};
    if (nextFilters.search) params.search = nextFilters.search;
    if (nextFilters.entityType) params.entityType = nextFilters.entityType;
    if (nextFilters.startDate) params.startDate = nextFilters.startDate;
    if (nextFilters.endDate) params.endDate = nextFilters.endDate;
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
    await loadLogs(filters, nextPage);
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
  }, [filters.search, filters.entityType, filters.startDate, filters.endDate]);

  async function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;

    setPage(nextPage);
    updateUrl(filters, nextPage);
    await loadLogs(filters, nextPage);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                label="Buscar por ação"
                name="search"
                placeholder="Ex: ADMIN_UPDATE_USER..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label="Entidade"
                name="entityType"
                value={filters.entityType}
                onChange={handleFilterChange}
              >
                {ENTITY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-36">
              <Input
                label="Data início"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="w-full sm:w-36">
              <Input
                label="Data fim"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
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
              <Button variant="secondary" size="sm" onClick={() => loadLogs(filters, page)}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : null}

        {!loading && !error && logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="Nenhum registro de auditoria encontrado"
            description="Não há logs de auditoria registrados ou nenhum corresponde aos filtros aplicados."
          />
        ) : null}

        {!loading && !error && logs.length > 0 ? (
          <>
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Data</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Usuário</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Tenant</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Ação</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Entidade</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">ID Entidade</th>
                    <th className="hidden px-6 py-4 font-semibold text-slate-700 sm:table-cell dark:text-slate-300">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDateBR(log.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{log.user?.name || log.userName || '--'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{log.user?.email || log.userEmail || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{log.tenant?.name || log.tenantName || '--'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {formatActionLabel(log.action)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{log.entityType || log.entity || '--'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{log.entityId || '--'}</td>
                      <td className="hidden px-6 py-4 font-mono text-xs text-slate-500 sm:table-cell dark:text-slate-400">{log.ipAddress || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <div className="flex items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
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
      </div>
    </AdminLayout>
  );
}

export default AdminAuditLogs;
