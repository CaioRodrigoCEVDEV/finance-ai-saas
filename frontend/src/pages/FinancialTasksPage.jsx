import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckSquare, Plus } from 'lucide-react';

import FinancialTaskFilters from '../components/financialTasks/FinancialTaskFilters';
import FinancialTaskList from '../components/financialTasks/FinancialTaskList';
import FinancialTaskModal from '../components/financialTasks/FinancialTaskModal';
import FinancialTaskSummary from '../components/financialTasks/FinancialTaskSummary';
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
  completeFinancialTask
} from '../services/financialTaskService';

const initialFilters = {
  status: '',
  priority: '',
  search: '',
  preset: ''
};

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

  if (filters.preset === 'pending') {
    params.status = 'PENDING';
  } else if (filters.preset === 'completed') {
    params.status = 'COMPLETED';
  }

  return params;
}

function FinancialTasksPage() {
  const toast = useToast();
  const searchTimeout = useRef(null);
  const isMounted = useRef(false);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [summary, setSummary] = useState({ pending: 0, overdue: 0, today: 0, completed: 0, nextTasks: [] });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function loadTasksData(nextFilters = filters) {
    try {
      setLoading(true);
      setError('');
      const response = await getFinancialTasks(buildListParams(nextFilters));
      setTasks(response.data);
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

  async function handleToggleStatus(task) {
    try {
      setSaving(true);
      setError('');

      if (task.status === 'COMPLETED') {
        await updateFinancialTask(task.id, { status: 'PENDING' });
        toast.success('Tarefa marcada como pendente.');
      } else {
        await completeFinancialTask(task.id);
        toast.success('Tarefa concluida com sucesso.');
      }

      await Promise.all([
        loadTasksData(filters),
        loadSummary()
      ]);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Nao foi possivel atualizar o status da tarefa.');
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

  return (
    <AppLayout>
      <div className="space-y-8 pb-8 w-full max-w-full">
        <PageHeader
          title="Tarefas"
          description="Organize suas tarefas em uma lista simples para acompanhar o que esta pendente e o que ja foi concluido."
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
              description="Crie sua primeira tarefa para organizar atividades, prazos e acompanhamentos do dia a dia."
              action={<Button onClick={handleCreateClick}>Criar tarefa</Button>}
            />
          ) : null}

          {!loading && !error && tasks.length > 0 ? (
            <FinancialTaskList
              tasks={tasks}
              loading={saving}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : null}
        </div>

        <FormModal
          isOpen={formVisible}
          eyebrow={selectedTask ? 'EDITAR TAREFA' : 'NOVA TAREFA'}
          title={selectedTask ? 'Editar tarefa' : 'Nova tarefa'}
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
            onSubmit={handleSubmit}
          />
        </FormModal>

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
