import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckSquare, Plus } from 'lucide-react';

import FinancialTaskFilters from '../components/financialTasks/FinancialTaskFilters';
import FinancialTaskList from '../components/financialTasks/FinancialTaskList';
import FinancialTaskModal from '../components/financialTasks/FinancialTaskModal';
import FinancialTaskSummary from '../components/financialTasks/FinancialTaskSummary';
import GenerateTransactionModal from '../components/financialTasks/GenerateTransactionModal';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import FormModal from '../components/ui/FormModal';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../contexts/ToastContext';
import {
  createFinancialTask,
  deleteFinancialTask,
  getFinancialTask,
  getFinancialTaskDashboard,
  getFinancialTasks,
  updateFinancialTask,
  completeFinancialTask,
  generateTransaction,
  createTaskItem,
  updateTaskItem,
  deleteTaskItem,
  reorderTaskItems
} from '../services/financialTaskService';
import { getAccounts } from '../services/accountService';
import { getCategories } from '../services/categoryService';

const initialFilters = {
  status: '',
  priority: '',
  search: '',
  preset: ''
};

function buildDateRange(preset) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (preset === 'today') {
    return { dueDateLte: now.toISOString(), dueDateGte: now.toISOString() };
  }

  if (preset === 'week') {
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    return { dueDateGte: now.toISOString(), dueDateLte: endOfWeek.toISOString() };
  }

  return {};
}

function buildListParams(filters) {
  const params = {};

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.priority) {
    params.priority = filters.priority;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.preset === 'overdue') {
    params.overdue = 'true';
  } else if (filters.preset === 'pending') {
    params.status = 'PENDING';
  } else if (filters.preset === 'completed') {
    params.status = 'COMPLETED';
  } else if (filters.preset === 'urgent') {
    params.priority = 'URGENT';
  } else if (filters.preset === 'today' || filters.preset === 'week') {
    const dateRange = buildDateRange(filters.preset);
    if (dateRange.dueDateGte) params.dueDateGte = dateRange.dueDateGte;
    if (dateRange.dueDateLte) params.dueDateLte = dateRange.dueDateLte;
  }

  return params;
}

function FinancialTasksPage() {
  const toast = useToast();
  const searchTimeout = useRef(null);
  const isMounted = useRef(false);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState(initialFilters);
  const [summary, setSummary] = useState({ pending: 0, overdue: 0, today: 0, completed: 0, nextTasks: [] });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [generateTxTask, setGenerateTxTask] = useState(null);

  async function loadTasksData(nextFilters = filters) {
    try {
      setLoading(true);
      setError('');
      const response = await getFinancialTasks(buildListParams(nextFilters));
      setTasks(response.data);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessao expirou. Entre novamente para continuar.'
          : 'Nao foi possivel carregar as tarefas agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      setSummaryLoading(true);
      const data = await getFinancialTaskDashboard();
      setSummary(data);
    } catch (_error) {
      setSummary({ pending: 0, overdue: 0, today: 0, completed: 0, nextTasks: [] });
    } finally {
      setSummaryLoading(false);
    }
  }

  async function loadPageData(nextFilters = filters) {
    await Promise.all([
      loadTasksData(nextFilters),
      loadSummary()
    ]);
  }

  useEffect(() => {
    loadPageData(initialFilters);
    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      return undefined;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      loadTasksData(filters);
    }, filters.search ? 300 : 0);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [filters]);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (_error) {
        /* silent */
      }
    }

    loadAccounts();
  }, []);

  function handleCreateClick() {
    setSelectedTask(null);
    setFormVisible(true);
    setError('');
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value
    }));
  }

  function handlePreset(value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      preset: currentFilters.preset === value ? '' : value
    }));
  }

  async function handleEdit(task) {
    try {
      setSaving(true);
      setError('');
      const data = await getFinancialTask(task.id);
      setSelectedTask(data);
      setFormVisible(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Nao foi possivel carregar a tarefa para edicao.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');

      if (selectedTask) {
        await updateFinancialTask(selectedTask.id, payload);
        toast.success('Tarefa atualizada com sucesso.');
      } else {
        await createFinancialTask(payload);
        toast.success('Tarefa criada com sucesso.');
      }

      setFormVisible(false);
      setSelectedTask(null);
      await Promise.all([
        loadTasksData(filters),
        loadSummary()
      ]);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Nao foi possivel salvar a tarefa.');
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(task) {
    try {
      setSaving(true);
      setError('');
      await completeFinancialTask(task.id);
      toast.success('Tarefa concluida com sucesso.');
      await Promise.all([
        loadTasksData(filters),
        loadSummary()
      ]);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Nao foi possivel concluir a tarefa.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(task) {
    setConfirmDelete(task);
  }

  async function confirmDeleteTask() {
    if (!confirmDelete) return;

    const taskToDelete = confirmDelete;
    setConfirmDelete(null);

    try {
      setSaving(true);
      setError('');
      await deleteFinancialTask(taskToDelete.id);

      if (selectedTask?.id === taskToDelete.id) {
        setSelectedTask(null);
        setFormVisible(false);
      }

      toast.success('Tarefa excluida com sucesso.');
      await Promise.all([
        loadTasksData(filters),
        loadSummary()
      ]);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Nao foi possivel excluir a tarefa.');
    } finally {
      setSaving(false);
    }
  }

  async function handleClearFilters() {
    setFilters(initialFilters);
    await Promise.all([
      loadTasksData(initialFilters),
      loadSummary()
    ]);
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedTask(null);
  }

  function handleGenerateTransactionClick(task) {
    setGenerateTxTask(task);
    if (categories.length === 0) {
      getCategories().then((result) => setCategories(result.data || [])).catch(() => {});
    }
  }

  async function handleGenerateTransaction(data) {
    if (!generateTxTask) return;

    try {
      setSaving(true);
      await generateTransaction(generateTxTask.id, data);
      toast.success('Transacao gerada com sucesso.');
      setGenerateTxTask(null);
      await Promise.all([
        loadTasksData(filters),
        loadSummary()
      ]);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Nao foi possivel gerar a transacao.');
    } finally {
      setSaving(false);
    }
  }

  async function handleItemAdd(taskId, payload) {
    try {
      const item = await createTaskItem(taskId, payload);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                items: [...(t.items || []), item],
                totalItems: (t.totalItems || 0) + 1,
                progress: t.totalItems > 0
                  ? Math.round(((t.completedItems || 0) / ((t.totalItems || 0) + 1)) * 100)
                  : 0
              }
            : t
        )
      );
      await loadSummary();
      return item;
    } catch (error) {
      toast.error('Nao foi possivel adicionar o item.');
      throw error;
    }
  }

  async function handleItemUpdate(taskId, itemId, payload) {
    try {
      await updateTaskItem(taskId, itemId, payload);
      const updatedTask = await getFinancialTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t))
      );

      if (updatedTask.status === 'COMPLETED' && formVisible && selectedTask?.id === taskId) {
        setFormVisible(false);
        setSelectedTask(null);
      }

      await loadSummary();
    } catch (error) {
      toast.error('Nao foi possivel atualizar o item.');
    }
  }

  async function handleItemDelete(taskId, itemId, rollback) {
    try {
      await deleteTaskItem(taskId, itemId);
      await loadSummary();
    } catch (error) {
      if (rollback) rollback();
      toast.error('Nao foi possivel excluir o item.');
    }
  }

  async function handleItemReorder(taskId, items) {
    try {
      await reorderTaskItems(taskId, items);
    } catch (error) {
      toast.error('Nao foi possivel reordenar os itens.');
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8 w-full max-w-full">
        <PageHeader
          title="Tarefas Financeiras"
          description="Organize pagamentos, revisoes e compromissos financeiros."
          action={(
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              Nova tarefa
            </Button>
          )}
        />

        {summaryLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-36 rounded-[28px]" />)}
          </div>
        ) : (
          <FinancialTaskSummary summary={summary} loading={summaryLoading} />
        )}

        <FinancialTaskFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          onPreset={handlePreset}
          loading={loading}
        />

        <div className="space-y-6">
          {loading ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-48 rounded-[30px]" />)}
            </div>
          ) : null}

          {!loading && error ? (
            <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">Falha ao processar tarefas</p>
                  <p className="mt-2 text-sm text-rose-700">{error}</p>
                  <div className="mt-4">
                    <Button variant="secondary" onClick={() => loadPageData(filters)}>Tentar novamente</Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {!loading && !error && tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="Nenhuma tarefa encontrada"
              description="Crie sua primeira tarefa financeira para organizar pagamentos, revisoes e compromissos."
              action={<Button onClick={handleCreateClick}>Criar tarefa</Button>}
            />
          ) : null}

          {!loading && !error && tasks.length > 0 ? (
            <FinancialTaskList
              tasks={tasks}
              loading={saving}
              onComplete={handleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onGenerateTransaction={handleGenerateTransactionClick}
            />
          ) : null}
        </div>

        <FormModal
          isOpen={formVisible}
          eyebrow={selectedTask ? 'EDITAR TAREFA' : 'NOVA TAREFA'}
          title={selectedTask ? 'Atualize os dados da tarefa financeira' : 'Cadastre uma nova tarefa financeira'}
          onClose={handleCancelForm}
          footer={(
            <>
              <Button type="button" variant="secondary" onClick={handleCancelForm}>Cancelar</Button>
              <Button type="submit" form="financial-task-form" disabled={saving}>
                {saving ? 'Salvando...' : selectedTask ? 'Salvar alteracoes' : 'Criar tarefa'}
              </Button>
            </>
          )}
        >
          <FinancialTaskModal
            task={selectedTask}
            accounts={accounts}
            onSubmit={handleSubmit}
            onItemAdd={(payload) => selectedTask && handleItemAdd(selectedTask.id, payload)}
            onItemUpdate={(itemId, payload) => selectedTask && handleItemUpdate(selectedTask.id, itemId, payload)}
            onItemDelete={(itemId, rollback) => selectedTask && handleItemDelete(selectedTask.id, itemId, rollback)}
            onItemReorder={(items) => selectedTask && handleItemReorder(selectedTask.id, items)}
          />
        </FormModal>

        <GenerateTransactionModal
          isOpen={!!generateTxTask}
          task={generateTxTask}
          accounts={accounts}
          categories={categories}
          onConfirm={handleGenerateTransaction}
          onClose={() => setGenerateTxTask(null)}
          saving={saving}
        />

        <ConfirmDialog
          open={!!confirmDelete}
          title="Excluir tarefa"
          message={`Deseja realmente excluir a tarefa "${confirmDelete?.title || ''}"?`}
          onConfirm={confirmDeleteTask}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </AppLayout>
  );
}

export default FinancialTasksPage;
