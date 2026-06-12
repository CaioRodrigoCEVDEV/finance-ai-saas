import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Target, Plus } from 'lucide-react';

import GoalCard from '../components/goals/GoalCard';
import GoalFilters from '../components/goals/GoalFilters';
import GoalForm from '../components/goals/GoalForm';
import GoalProgressModal from '../components/goals/GoalProgressModal';
import GoalSummaryCards from '../components/goals/GoalSummaryCards';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import {
  createGoal,
  deleteGoal,
  getGoal,
  getGoals,
  getGoalSummary,
  updateGoal,
  updateGoalProgress
} from '../services/goalService';

const initialFilters = {
  status: '',
  search: ''
};

function buildListParams(filters) {
  const params = {};

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  return params;
}

function Goals() {
  const hasInitializedFilters = useRef(false);
  const [goals, setGoals] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [summary, setSummary] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    canceledGoals: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0,
    overallProgressPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [progressGoal, setProgressGoal] = useState(null);
  const [progressError, setProgressError] = useState('');

  async function loadGoalsData(nextFilters = filters) {
    try {
      setLoading(true);
      setError('');
      const data = await getGoals(buildListParams(nextFilters));
      setGoals(data);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : 'Não foi possível carregar as metas agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      setSummaryLoading(true);
      const data = await getGoalSummary();
      setSummary(data);
    } catch (_error) {
      setSummary({
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        canceledGoals: 0,
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        overallProgressPercentage: 0
      });
    } finally {
      setSummaryLoading(false);
    }
  }

  async function loadPageData(nextFilters = filters) {
    try {
      await Promise.all([
        loadGoalsData(nextFilters),
        loadSummary()
      ]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar os dados da tela de metas.');
    }
  }

  useEffect(() => {
    loadPageData(initialFilters);
  }, []);

  useEffect(() => {
    if (!hasInitializedFilters.current) {
      hasInitializedFilters.current = true;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      loadGoalsData(filters);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  function handleCreateClick() {
    setSelectedGoal(null);
    setFormVisible(true);
    setError('');
    setFormError('');
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value
    }));
  }

  async function handleEdit(goal) {
    try {
      setSaving(true);
      setError('');
      setFormError('');
      const data = await getGoal(goal.id);
      setSelectedGoal(data);
      setFormVisible(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar a meta para edição.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');
      setFormError('');

      if (selectedGoal) {
        await updateGoal(selectedGoal.id, payload);
      } else {
        await createGoal(payload);
      }

      setFormVisible(false);
      setSelectedGoal(null);
      await Promise.all([
        loadGoalsData(filters),
        loadSummary()
      ]);
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Não foi possível salvar a meta.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(goal) {
    const confirmed = window.confirm(`Deseja realmente excluir a meta "${goal.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await deleteGoal(goal.id);

      if (selectedGoal?.id === goal.id) {
        setSelectedGoal(null);
        setFormVisible(false);
      }

      if (progressGoal?.id === goal.id) {
        setProgressGoal(null);
        setProgressModalVisible(false);
      }

      await Promise.all([
        loadGoalsData(filters),
        loadSummary()
      ]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível excluir a meta.');
    } finally {
      setSaving(false);
    }
  }

  function handleUpdateProgressClick(goal) {
    setProgressGoal(goal);
    setProgressModalVisible(true);
    setProgressError('');
  }

  async function handleProgressSubmit(payload) {
    try {
      setSaving(true);
      setProgressError('');
      await updateGoalProgress(progressGoal.id, payload);
      setProgressModalVisible(false);
      setProgressGoal(null);
      await Promise.all([
        loadGoalsData(filters),
        loadSummary()
      ]);
    } catch (requestError) {
      setProgressError(requestError.response?.data?.message || 'Não foi possível atualizar o progresso.');
    } finally {
      setSaving(false);
    }
  }

  async function handleClearFilters() {
    setFilters(initialFilters);
    await Promise.all([
      loadGoalsData(initialFilters),
      loadSummary()
    ]);
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedGoal(null);
    setFormError('');
  }

  function handleCancelProgress() {
    setProgressModalVisible(false);
    setProgressGoal(null);
    setProgressError('');
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Metas financeiras"
          description="Planeje objetivos e acompanhe seu progresso financeiro."
          action={(
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              Nova meta
            </Button>
          )}
        />

        {summaryLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-36 rounded-[28px]" />)}
          </div>
        ) : (
          <GoalSummaryCards summary={summary} />
        )}

        <GoalFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          loading={loading}
        />

        <div className="space-y-6">
          {loading ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-72 rounded-[30px]" />)}
            </div>
          ) : null}

          {!loading && error ? (
            <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">Falha ao processar metas</p>
                  <p className="mt-2 text-sm text-rose-700">{error}</p>
                  <div className="mt-4">
                    <Button variant="secondary" onClick={() => loadPageData(filters)}>Tentar novamente</Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {!loading && !error && goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Nenhuma meta encontrada"
              description="Crie sua primeira meta financeira para acompanhar objetivos como reserva de emergencia, viagem ou compras planejadas."
              action={<Button onClick={handleCreateClick}>Criar meta</Button>}
            />
          ) : null}

          {!loading && !error && goals.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  loading={saving}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateProgress={handleUpdateProgressClick}
                />
              ))}
            </div>
          ) : null}
        </div>

        <Modal isOpen={formVisible} title={selectedGoal ? 'Editar meta' : 'Nova meta'} onClose={handleCancelForm}>
          <GoalForm
            goal={selectedGoal}
            loading={saving}
            serverError={formError}
            onCancel={handleCancelForm}
            onSubmit={handleSubmit}
          />
        </Modal>

        <GoalProgressModal
          isOpen={progressModalVisible}
          goal={progressGoal}
          loading={saving}
          serverError={progressError}
          onClose={handleCancelProgress}
          onSubmit={handleProgressSubmit}
        />
      </div>
    </AppLayout>
  );
}

export default Goals;
