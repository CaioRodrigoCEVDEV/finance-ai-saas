import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';

import AdminLayout from '../../layouts/admin/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';
import { getFeedback, listFeedbacks, updateFeedbackStatus } from '../../services/adminService';
import { formatDateBR } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'OPEN', label: 'Aberto' },
  { value: 'IN_REVIEW', label: 'Em revisão' },
  { value: 'RESOLVED', label: 'Resolvido' },
  { value: 'CLOSED', label: 'Fechado' }
];

const STATUS_BADGE = {
  OPEN: { variant: 'warning', label: 'Aberto' },
  IN_REVIEW: { variant: 'info', label: 'Em revisão' },
  RESOLVED: { variant: 'success', label: 'Resolvido' },
  CLOSED: { variant: 'neutral', label: 'Fechado' }
};

const STATUS_UPDATE_OPTIONS = [
  { value: '', label: 'Selecionar novo status...' },
  { value: 'OPEN', label: 'Aberto' },
  { value: 'IN_REVIEW', label: 'Em revisão' },
  { value: 'RESOLVED', label: 'Resolvido' },
  { value: 'CLOSED', label: 'Fechado' }
];

const INITIAL_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1
};

function buildParams(filters, page) {
  const params = { page, limit: 20 };

  if (filters.status) params.status = filters.status;

  return params;
}

function truncateMessage(message, maxLength = 80) {
  if (!message) return '';
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + '...';
}

function AdminFeedbacks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const hasInitializedFromUrl = useRef(false);

  const [feedbacks, setFeedbacks] = useState([]);
  const [filters, setFilters] = useState(() => ({
    status: searchParams.get('status') || ''
  }));
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [detailModal, setDetailModal] = useState({ isOpen: false, feedback: null });
  const [detailLoading, setDetailLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const loadFeedbacks = useCallback(async (currentFilters, currentPage) => {
    try {
      setLoading(true);
      setError('');

      const data = await listFeedbacks(buildParams(currentFilters, currentPage));

      setFeedbacks(data.data);
      setPagination(data.pagination);
      setPage(data.pagination.page);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : requestError.response?.data?.message || 'Não foi possível carregar os feedbacks.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedbacks(filters, page);
  }, []);

  function updateUrl(nextFilters, nextPage) {
    const params = {};
    if (nextFilters.status) params.status = nextFilters.status;
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
    await loadFeedbacks(filters, nextPage);
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
  }, [filters.status]);

  async function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;

    setPage(nextPage);
    updateUrl(filters, nextPage);
    await loadFeedbacks(filters, nextPage);
  }

  async function handleOpenDetail(feedbackId) {
    setDetailModal({ isOpen: true, feedback: null });
    setNewStatus('');

    try {
      setDetailLoading(true);
      const data = await getFeedback(feedbackId);
      setDetailModal({ isOpen: true, feedback: data.feedback || data });
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Erro ao carregar feedback.');
      setDetailModal({ isOpen: false, feedback: null });
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetailModal() {
    setDetailModal({ isOpen: false, feedback: null });
    setNewStatus('');
  }

  async function handleUpdateStatus() {
    if (!newStatus || !detailModal.feedback) return;

    try {
      setActionLoading(true);
      await updateFeedbackStatus(detailModal.feedback.id, newStatus);
      toast.success('Status atualizado com sucesso.');

      const data = await getFeedback(detailModal.feedback.id);
      setDetailModal({ isOpen: true, feedback: data.feedback || data });
      setNewStatus('');

      await loadFeedbacks(filters, page);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Erro ao atualizar status.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
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
              <Button variant="secondary" size="sm" onClick={() => loadFeedbacks(filters, page)}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : null}

        {!loading && !error && feedbacks.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="Nenhum feedback encontrado"
            description="Não há feedbacks cadastrados ou nenhum corresponde aos filtros aplicados."
          />
        ) : null}

        {!loading && !error && feedbacks.length > 0 ? (
          <>
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Data</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Tenant</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Usuário</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Mensagem</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {feedbacks.map((feedback) => {
                    const statusInfo = STATUS_BADGE[feedback.status] || { variant: 'neutral', label: feedback.status };

                    return (
                      <tr key={feedback.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDateBR(feedback.createdAt)}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{feedback.tenant?.name || '--'}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{feedback.user?.name || '--'}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{feedback.user?.email || '--'}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{truncateMessage(feedback.message)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="secondary" size="sm" onClick={() => handleOpenDetail(feedback.id)}>
                            Ver
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>

            <div className="flex items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-4 shadow-soft dark:border-slate-700 dark:bg-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} feedbacks)
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
          isOpen={detailModal.isOpen}
          title="Detalhes do feedback"
          onClose={closeDetailModal}
        >
          {detailLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton className="h-6 w-3/4" />
              <LoadingSkeleton className="h-24 w-full" />
            </div>
          ) : detailModal.feedback ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Tenant</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{detailModal.feedback.tenant?.name || '--'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Usuário</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{detailModal.feedback.user?.name || '--'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{detailModal.feedback.user?.email || '--'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Data</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{formatDateBR(detailModal.feedback.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Status atual</p>
                <div className="mt-1">
                  <Badge variant={STATUS_BADGE[detailModal.feedback.status]?.variant || 'neutral'}>
                    {STATUS_BADGE[detailModal.feedback.status]?.label || detailModal.feedback.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Mensagem</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">{detailModal.feedback.message || '--'}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Alterar status</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="w-full sm:w-52">
                    <Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      {STATUS_UPDATE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUpdateStatus}
                    disabled={actionLoading || !newStatus}
                  >
                    Atualizar
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default AdminFeedbacks;
