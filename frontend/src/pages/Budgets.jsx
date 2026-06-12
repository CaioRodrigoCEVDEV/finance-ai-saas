import { useEffect, useRef, useState } from 'react';
import { AlertCircle, PiggyBank, Plus } from 'lucide-react';

import BudgetCard from '../components/budgets/BudgetCard';
import BudgetFilters from '../components/budgets/BudgetFilters';
import BudgetForm from '../components/budgets/BudgetForm';
import BudgetSummaryCards from '../components/budgets/BudgetSummaryCards';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { getCategories } from '../services/categoryService';
import {
  createBudget,
  deleteBudget,
  getBudget,
  getBudgetMonthSummary,
  getBudgets,
  updateBudget
} from '../services/budgetService';

const now = new Date();

const initialFilters = {
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear()),
  categoryId: ''
};

const initialSummary = {
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  totalBudget: 0,
  totalUsed: 0,
  totalRemaining: 0,
  usedPercentage: 0,
  safeCount: 0,
  warningCount: 0,
  exceededCount: 0
};

function buildListParams(filters) {
  const params = {
    month: Number(filters.month),
    year: Number(filters.year)
  };

  if (filters.categoryId) {
    params.categoryId = filters.categoryId;
  }

  return params;
}

function Budgets() {
  const hasInitializedFilters = useRef(false);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  async function loadCategories() {
    const data = await getCategories({ includeInactive: false, type: 'EXPENSE' });
    setCategories(data.filter((category) => category.type === 'EXPENSE'));
  }

  async function loadBudgetsData(nextFilters = filters) {
    try {
      setLoading(true);
      setError('');
      const data = await getBudgets(buildListParams(nextFilters));
      setBudgets(data);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : 'Não foi possível carregar os orçamentos agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary(nextFilters = filters) {
    try {
      setSummaryLoading(true);
      const data = await getBudgetMonthSummary({
        month: Number(nextFilters.month),
        year: Number(nextFilters.year)
      });
      setSummary(data);
    } catch (_error) {
      setSummary({
        ...initialSummary,
        month: Number(nextFilters.month),
        year: Number(nextFilters.year)
      });
    } finally {
      setSummaryLoading(false);
    }
  }

  async function loadPageData(nextFilters = filters) {
    try {
      await Promise.all([
        loadCategories(),
        loadBudgetsData(nextFilters),
        loadSummary(nextFilters)
      ]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar os dados da tela de orçamentos.');
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
      loadBudgetsData(filters);
      loadSummary(filters);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  function handleCreateClick() {
    setSelectedBudget(null);
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

  async function handleEdit(budget) {
    try {
      setSaving(true);
      setError('');
      setFormError('');
      const data = await getBudget(budget.id);
      setSelectedBudget(data);
      setFormVisible(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar o orçamento para edição.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');
      setFormError('');

      if (selectedBudget) {
        await updateBudget(selectedBudget.id, payload);
      } else {
        await createBudget(payload);
      }

      setFormVisible(false);
      setSelectedBudget(null);
      await Promise.all([
        loadBudgetsData(filters),
        loadSummary(filters)
      ]);
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Não foi possível salvar o orçamento.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(budget) {
    const confirmed = window.confirm(`Deseja realmente excluir o orçamento "${budget.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await deleteBudget(budget.id);

      if (selectedBudget?.id === budget.id) {
        setSelectedBudget(null);
        setFormVisible(false);
      }

      await Promise.all([
        loadBudgetsData(filters),
        loadSummary(filters)
      ]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível excluir o orçamento.');
    } finally {
      setSaving(false);
    }
  }

  async function handleClearFilters() {
    setFilters(initialFilters);
    await Promise.all([
      loadBudgetsData(initialFilters),
      loadSummary(initialFilters)
    ]);
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedBudget(null);
    setFormError('');
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Orcamentos"
          description="Defina limites mensais e acompanhe seus gastos por categoria."
          action={(
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              Novo orçamento
            </Button>
          )}
        />

        {summaryLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-36 rounded-[28px]" />)}
          </div>
        ) : (
          <BudgetSummaryCards summary={summary} />
        )}

        <BudgetFilters
          filters={filters}
          categories={categories}
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
                  <p className="text-lg font-medium text-slate-900">Falha ao processar orçamentos</p>
                  <p className="mt-2 text-sm text-rose-700">{error}</p>
                  <div className="mt-4">
                    <Button variant="secondary" onClick={() => loadPageData(filters)}>Tentar novamente</Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {!loading && !error && budgets.length === 0 ? (
            <EmptyState
              icon={PiggyBank}
              title="Nenhum orçamento encontrado"
              description="Crie o primeiro orçamento do mes selecionado para acompanhar consumo por categoria com calculo baseado nas transacoes confirmadas."
              action={<Button onClick={handleCreateClick}>Criar orçamento</Button>}
            />
          ) : null}

          {!loading && !error && budgets.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {budgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} loading={saving} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          ) : null}
        </div>

        <Modal isOpen={formVisible} title={selectedBudget ? 'Editar orçamento' : 'Novo orçamento'} onClose={handleCancelForm}>
          <BudgetForm
            budget={selectedBudget}
            categories={categories}
            loading={saving}
            serverError={formError}
            onCancel={handleCancelForm}
            onSubmit={handleSubmit}
          />
        </Modal>
      </div>
    </AppLayout>
  );
}

export default Budgets;
