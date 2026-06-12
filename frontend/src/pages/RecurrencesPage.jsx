import { useEffect, useRef, useState } from 'react';
import { Pause, Pencil, Play, Plus, RefreshCw, Repeat, Trash2, XCircle } from 'lucide-react';

import RecurrenceForm from '../components/recurrences/RecurrenceForm';
import AppLayout from '../layouts/AppLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import MetricCard from '../components/MetricCard';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Select from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrencyBRL, formatDateBR } from '../utils/formatters';
import { getAccounts } from '../services/accountService';
import { getCategories } from '../services/categoryService';
import { getCreditCards } from '../services/creditCardService';
import {
  listRecurrences,
  getRecurrence,
  createRecurrence,
  updateRecurrence,
  updateRecurrenceStatus,
  deleteRecurrence,
  generateRecurrence
} from '../services/recurrenceService';

const TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'EXPENSE', label: 'Despesas' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativas' },
  { value: 'PAUSED', label: 'Pausadas' },
  { value: 'FINISHED', label: 'Finalizadas' }
];

const FREQUENCY_OPTIONS = [
  { value: '', label: 'Todas as frequencias' },
  { value: 'DAILY', label: 'Diária' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'BIWEEKLY', label: 'Quinzenal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'BIMONTHLY', label: 'Bimestral' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUAL', label: 'Semestral' },
  { value: 'YEARLY', label: 'Anual' }
];

function getTypeVariant(type) {
  return type === 'INCOME' ? 'success' : 'danger';
}

function getStatusVariant(status) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'PAUSED') return 'warning';
  return 'neutral';
}

function formatRecurrenceType(type) {
  return type === 'INCOME' ? 'Receita' : 'Despesa';
}

function formatRecurrenceStatus(status) {
  if (status === 'ACTIVE') return 'Ativa';
  if (status === 'PAUSED') return 'Pausada';
  if (status === 'FINISHED') return 'Finalizada';
  return status;
}

function formatFrequency(frequency) {
  const labels = {
    DAILY: 'Diária',
    WEEKLY: 'Semanal',
    BIWEEKLY: 'Quinzenal',
    MONTHLY: 'Mensal',
    BIMONTHLY: 'Bimestral',
    QUARTERLY: 'Trimestral',
    SEMIANNUAL: 'Semestral',
    YEARLY: 'Anual'
  };
  return labels[frequency] || frequency;
}

function getMonthlyEstimate(recurrence) {
  const amount = Number(recurrence.amount || 0);
  switch (recurrence.frequency) {
    case 'DAILY': return amount * 30;
    case 'WEEKLY': return amount * 4;
    case 'BIWEEKLY': return amount * 2;
    case 'MONTHLY': return amount;
    case 'BIMONTHLY': return amount / 2;
    case 'QUARTERLY': return amount / 3;
    case 'SEMIANNUAL': return amount / 6;
    case 'YEARLY': return amount / 12;
    default: return amount;
  }
}

const initialFilters = {
  search: '',
  type: '',
  status: '',
  frequency: ''
};

function RecurrencesPage() {
  const { tenant } = useAuth();
  const isReadonly = tenant?.role === 'READONLY';
  const hasInitializedFilters = useRef(false);

  const [recurrences, setRecurrences] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedRecurrence, setSelectedRecurrence] = useState(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateTarget, setGenerateTarget] = useState(null);
  const [toast, setToast] = useState('');

  async function loadReferences() {
    const [accountData, categoryData, creditCardData] = await Promise.all([
      getAccounts(),
      getCategories({ includeInactive: false }),
      getCreditCards()
    ]);
    setAccounts(accountData);
    setCategories(categoryData);
    setCreditCards(creditCardData);
  }

  async function loadRecurrences(nextFilters = filters) {
    try {
      setLoading(true);
      setError('');

      const params = {};
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const data = await listRecurrences(params);
      setRecurrences(data);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : 'Não foi possível carregar as recorrências agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([
      loadReferences(),
      loadRecurrences()
    ]);
  }, []);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value
    }));
  }

  useEffect(() => {
    if (!hasInitializedFilters.current) {
      hasInitializedFilters.current = true;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      loadRecurrences(filters);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  function handleCreateClick() {
    setSelectedRecurrence(null);
    setFormVisible(true);
    setError('');
    setFormError('');
  }

  async function handleEdit(recurrence) {
    try {
      setSaving(true);
      setError('');
      const data = await getRecurrence(recurrence.id);
      setSelectedRecurrence(data);
      setFormVisible(true);
      setFormError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar a recorrência para edição.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');

      if (selectedRecurrence) {
        await updateRecurrence(selectedRecurrence.id, payload);
      } else {
        await createRecurrence(payload);
      }

      setFormVisible(false);
      setSelectedRecurrence(null);
      setFormError('');
      await loadRecurrences(filters);
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Não foi possível salvar a recorrência.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePauseToggle(recurrence) {
    const newStatus = recurrence.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      setSaving(true);
      setError('');
      await updateRecurrenceStatus(recurrence.id, newStatus);
      await loadRecurrences(filters);
      setToast(recurrence.status === 'ACTIVE' ? 'Recorrencia pausada com sucesso' : 'Recorrencia ativada com sucesso');
      setTimeout(() => setToast(''), 3000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível atualizar o status da recorrência.');
    } finally {
      setSaving(false);
    }
  }

  async function handleFinish(recurrence) {
    const confirmed = window.confirm(`Deseja finalizar a recorrência "${recurrence.description}"?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      await updateRecurrenceStatus(recurrence.id, 'FINISHED');
      await loadRecurrences(filters);
      setToast('Recorrencia finalizada com sucesso');
      setTimeout(() => setToast(''), 3000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível finalizar a recorrência.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(recurrence) {
    const confirmed = window.confirm(`Deseja realmente excluir a recorrência "${recurrence.description}"?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      await deleteRecurrence(recurrence.id);
      await loadRecurrences(filters);
      setToast('Recorrencia excluida com sucesso');
      setTimeout(() => setToast(''), 3000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível excluir a recorrência.');
    } finally {
      setSaving(false);
    }
  }

  function handleGenerateClick(recurrence) {
    setGenerateTarget(recurrence);
    setGenerateModalOpen(true);
  }

  async function handleGenerateConfirm() {
    if (!generateTarget) return;
    try {
      setSaving(true);
      setError('');
      await generateRecurrence(generateTarget.id);
      setGenerateModalOpen(false);
      setGenerateTarget(null);
      await loadRecurrences(filters);
      setToast('Lançamento gerado com sucesso');
      setTimeout(() => setToast(''), 3000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível gerar o lancamento.');
      setGenerateModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedRecurrence(null);
    setFormError('');
  }

  function handleClearFilters() {
    setFilters(initialFilters);
    loadRecurrences(initialFilters);
  }

  const activeCount = recurrences.filter((r) => r.status === 'ACTIVE').length;
  const pausedCount = recurrences.filter((r) => r.status === 'PAUSED').length;

  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const nextSevenDaysCount = recurrences.filter((r) => {
    if (r.status !== 'ACTIVE') return false;
    const nextRun = new Date(r.nextRunDate);
    return nextRun >= now && nextRun <= sevenDaysFromNow;
  }).length;

  const monthlyIncomeEstimate = recurrences
    .filter((r) => r.type === 'INCOME' && r.status === 'ACTIVE')
    .reduce((sum, r) => sum + getMonthlyEstimate(r), 0);

  const monthlyExpenseEstimate = recurrences
    .filter((r) => r.type === 'EXPENSE' && r.status === 'ACTIVE')
    .reduce((sum, r) => sum + getMonthlyEstimate(r), 0);

  const handleFormSubmit = async (payload) => {
    const sanitized = { ...payload };
    delete sanitized.endDateEnabled;
    await handleSubmit(sanitized);
  };

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Recorrências"
          description="Automatize receitas e despesas fixas do seu mês."
          action={isReadonly ? null : (
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              Nova recorrência
            </Button>
          )}
        />

        {isReadonly && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
            Você possui acesso somente leitura. As ações de criação, edição e exclusão estão desabilitadas.
          </div>
        )}

        {toast && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
            {toast}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Recorrências ativas" value={activeCount} description={`${pausedCount} pausadas`} />
          <MetricCard title="Próximos lancamentos" value={nextSevenDaysCount} description="Nos proximos 7 dias" />
          <MetricCard title="Receitas mensais estimadas" value={formatCurrencyBRL(monthlyIncomeEstimate)} description="Valor estimado mensal" />
          <MetricCard title="Despesas mensais estimadas" value={formatCurrencyBRL(monthlyExpenseEstimate)} description="Valor estimado mensal" />
        </div>

        <Card className="rounded-[28px] p-5">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <Input label="Buscar" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Buscar por descrição..." />
            </div>

            <Select label="Tipo" name="type" value={filters.type} onChange={handleFilterChange}>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>

            <Select label="Status" name="status" value={filters.status} onChange={handleFilterChange}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>

            <Select label="Frequência" name="frequency" value={filters.frequency} onChange={handleFilterChange}>
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>

          {(filters.search || filters.type || filters.status || filters.frequency) && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={handleClearFilters} disabled={loading}>Limpar filtros</Button>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => <LoadingSkeleton key={item} className="h-32 rounded-[28px]" />)}
            </div>
          ) : null}

          {!loading && error ? (
            <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">Falha ao processar recorrências</p>
                  <p className="mt-2 text-sm text-rose-700">{error}</p>
                  <div className="mt-4">
                    <Button variant="secondary" onClick={() => loadRecurrences(filters)}>Tentar novamente</Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {!loading && !error && recurrences.length === 0 ? (
            <EmptyState
              icon={Repeat}
              title="Nenhuma recorrência cadastrada"
              description="Cadastre despesas e receitas fixas para automatizar sua rotina financeira."
              action={isReadonly ? null : <Button onClick={handleCreateClick}>Criar primeira recorrência</Button>}
            />
          ) : null}

          {!loading && !error && recurrences.length > 0 ? (
            <>
              <div className="grid gap-4 lg:hidden">
                {recurrences.map((recurrence) => (
                  <RecurrenceMobileCard
                    key={recurrence.id}
                    recurrence={recurrence}
                    isReadonly={isReadonly}
                    loading={saving}
                    onGenerate={handleGenerateClick}
                    onEdit={handleEdit}
                    onPauseToggle={handlePauseToggle}
                    onFinish={handleFinish}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              <RecurrenceTable
                recurrences={recurrences}
                isReadonly={isReadonly}
                loading={saving}
                onGenerate={handleGenerateClick}
                onEdit={handleEdit}
                onPauseToggle={handlePauseToggle}
                onFinish={handleFinish}
                onDelete={handleDelete}
              />
            </>
          ) : null}
        </div>

        <Modal isOpen={formVisible} title={selectedRecurrence ? 'Editar recorrência' : 'Nova recorrência'} onClose={handleCancelForm}>
          <RecurrenceForm
            recurrence={selectedRecurrence}
            accounts={accounts}
            categories={categories}
            creditCards={creditCards}
            loading={saving}
            serverError={formError}
            onCancel={handleCancelForm}
              onSubmit={handleFormSubmit}
          />
        </Modal>

        <Modal isOpen={generateModalOpen} title="Gerar lancamento" onClose={() => { setGenerateModalOpen(false); setGenerateTarget(null); }}>
          <div className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              Deseja gerar agora o lancamento desta recorrência?
            </p>
            {generateTarget && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{generateTarget.description}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {formatCurrencyBRL(generateTarget.amount)} • {formatRecurrenceType(generateTarget.type)} • Próxima: {formatDateBR(generateTarget.nextRunDate)}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGenerateConfirm} disabled={saving}>
                {saving ? 'Gerando...' : 'Sim, gerar lancamento'}
              </Button>
              <Button variant="secondary" onClick={() => { setGenerateModalOpen(false); setGenerateTarget(null); }}>Cancelar</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}

function RecurrenceMobileCard({ recurrence, isReadonly, loading, onGenerate, onEdit, onPauseToggle, onFinish, onDelete }) {
  return (
    <Card className="rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-slate-100 break-words">{recurrence.description}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatFrequency(recurrence.frequency)}</p>
        </div>
        <Badge variant={getTypeVariant(recurrence.type)}>{formatRecurrenceType(recurrence.type)}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Valor</span>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(recurrence.amount)}</p>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Próximo lançamento</span>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{formatDateBR(recurrence.nextRunDate)}</p>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Status</span>
          <div className="mt-1"><Badge variant={getStatusVariant(recurrence.status)}>{formatRecurrenceStatus(recurrence.status)}</Badge></div>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Conta/Cartão</span>
          <p className="text-slate-900 dark:text-slate-100 truncate">{recurrence.creditCard?.name || recurrence.account?.name || '--'}</p>
        </div>
      </div>

      {recurrence.startDate && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Início: {formatDateBR(recurrence.startDate)}</p>
      )}
      {recurrence.lastRunDate && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Último lançamento: {formatDateBR(recurrence.lastRunDate)}</p>
      )}
      {recurrence.endDate && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Término: {formatDateBR(recurrence.endDate)}</p>
      )}

      {!isReadonly && (
        <div className="mt-4 flex flex-wrap gap-2">
          {recurrence.status === 'ACTIVE' && (
            <Button variant="secondary" size="sm" className="h-8 px-2.5 text-xs gap-1.5" onClick={() => onGenerate(recurrence)} disabled={loading}>
              <RefreshCw className="h-3.5 w-3.5" />
              Gerar
            </Button>
          )}
          <Button variant="secondary" size="sm" className="h-8 px-2.5 text-xs gap-1.5" onClick={() => onEdit(recurrence)} disabled={loading}>
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          {recurrence.status !== 'FINISHED' && (
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-2.5 text-xs gap-1.5"
              onClick={() => onPauseToggle(recurrence)}
              disabled={loading}
            >
              {recurrence.status === 'ACTIVE' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {recurrence.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
            </Button>
          )}
          {recurrence.status === 'ACTIVE' && (
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs gap-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700" onClick={() => onFinish(recurrence)} disabled={loading}>
              <XCircle className="h-3.5 w-3.5" />
              Finalizar
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => onDelete(recurrence)} disabled={loading}>
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </Button>
        </div>
      )}
    </Card>
  );
}

function RecurrenceTable({ recurrences, isReadonly, loading, onGenerate, onEdit, onPauseToggle, onFinish, onDelete }) {
  return (
    <Card className="hidden overflow-hidden rounded-[28px] p-0 lg:block">
      <div className="w-full overflow-hidden">
        <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <th className="px-3 py-3">Descrição</th>
              <th className="w-[85px] px-3 py-3">Tipo</th>
              <th className="w-[105px] px-3 py-3 text-right whitespace-nowrap">Valor</th>
              <th className="w-[90px] px-3 py-3">Frequência</th>
              <th className="w-[95px] px-3 py-3">Próximo</th>
              <th className="w-[80px] px-3 py-3">Status</th>
              <th className="w-[110px] px-3 py-3">Conta/Cartão</th>
              <th className="w-[200px] px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-800">
            {recurrences.map((recurrence) => {
              const holderName = recurrence.creditCard?.name || recurrence.account?.name || '--';

              return (
                <tr key={recurrence.id} className="align-top text-sm text-slate-600 dark:text-slate-400">
                  <td className="px-3 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 break-words">{recurrence.description}</p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {recurrence.category ? (
                          <span>{recurrence.category.name}</span>
                        ) : null}
                        {recurrence.startDate && (
                          <span>desde {formatDateBR(recurrence.startDate)}</span>
                        )}
                        {recurrence.endDate && (
                          <span>até {formatDateBR(recurrence.endDate)}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Badge variant={getTypeVariant(recurrence.type)}>{formatRecurrenceType(recurrence.type)}</Badge>
                  </td>
                  <td className={`px-3 py-3 text-right font-semibold whitespace-nowrap ${recurrence.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {recurrence.type === 'INCOME' ? '+' : '-'}{formatCurrencyBRL(recurrence.amount)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-slate-500 dark:text-slate-400">{formatFrequency(recurrence.frequency)}</span>
                  </td>
                  <td className="px-3 py-3 font-medium whitespace-nowrap text-slate-900 dark:text-slate-100">
                    {formatDateBR(recurrence.nextRunDate)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Badge variant={getStatusVariant(recurrence.status)}>{formatRecurrenceStatus(recurrence.status)}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <span className="block max-w-[110px] truncate">{holderName}</span>
                  </td>
                  <td className="px-3 py-3">
                    {isReadonly ? (
                      <span className="text-xs text-slate-400">Somente leitura</span>
                    ) : (
                      <div className="flex justify-end gap-1.5 whitespace-nowrap">
                        {recurrence.status === 'ACTIVE' && (
                          <Button variant="secondary" className="h-8 px-2.5 text-xs gap-1.5" onClick={() => onGenerate(recurrence)} disabled={loading}>
                            <RefreshCw className="h-3.5 w-3.5" />
                            Gerar
                          </Button>
                        )}
                        <Button variant="secondary" className="h-8 px-2.5 text-xs gap-1.5" onClick={() => onEdit(recurrence)} disabled={loading}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {recurrence.status !== 'FINISHED' && (
                          <Button
                            variant="secondary"
                            className="h-8 px-2.5 text-xs gap-1.5"
                            onClick={() => onPauseToggle(recurrence)}
                            disabled={loading}
                          >
                            {recurrence.status === 'ACTIVE' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                        {recurrence.status === 'ACTIVE' && (
                          <Button variant="ghost" className="h-8 px-2.5 text-xs text-amber-600 hover:bg-amber-50 hover:text-amber-700" onClick={() => onFinish(recurrence)} disabled={loading}>
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => onDelete(recurrence)} disabled={loading}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default RecurrencesPage;
