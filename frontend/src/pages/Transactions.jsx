import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeftRight, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionMobileCard from '../components/transactions/TransactionMobileCard';
import TransactionSummaryCards from '../components/transactions/TransactionSummaryCards';
import TransactionTable from '../components/transactions/TransactionTable';
import TransferForm from '../components/transfers/TransferForm';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import FormModal from '../components/ui/FormModal';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../contexts/ToastContext';
import { formatCurrencyBRL, formatDateBR } from '../utils/formatters';
import { getAccounts } from '../services/accountService';
import { getCategories } from '../services/categoryService';
import { getCreditCards } from '../services/creditCardService';
import {
  confirmTransaction,
  createTransaction,
  deleteTransaction,
  getTransaction,
  getTransactionMonthSummary,
  getTransactions,
  updateTransaction
} from '../services/transactionService';
import { DATA_MUTATIONS, publishDataMutation, useDataInvalidation } from '../utils/dataInvalidation';
import {
  getTransfer,
  createTransfer,
  updateTransfer,
  deleteTransfer
} from '../services/transferService';

function getFirstDayOfMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function getLastDayOfMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
}

const initialFilters = {
  search: '',
  type: '',
  status: '',
  origin: '',
  accountId: '',
  creditCardId: '',
  categoryId: '',
  startDate: getFirstDayOfMonth(),
  endDate: getLastDayOfMonth()
};

const initialSummary = {
  month: null,
  year: null,
  income: 0,
  expensePaid: 0,
  creditCardSpent: 0,
  balance: 0,
  totalTransactions: 0
};

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1
};

function buildListParams(filters, page) {
  const params = {
    page,
    limit: 20
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params[key] = value;
    }
  });

  return params;
}

function Transactions() {
  const hasInitializedFilters = useRef(false);
  const transactionsRequestId = useRef(0);
  const location = useLocation();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [summary, setSummary] = useState(initialSummary);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [pendingNewTransaction, setPendingNewTransaction] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [transferFormVisible, setTransferFormVisible] = useState(false);

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

  async function loadTransactionsData(nextFilters = filters, nextPage = page) {
    const requestId = transactionsRequestId.current + 1;
    transactionsRequestId.current = requestId;

    try {
      setLoading(true);
      setError('');

      const data = await getTransactions(buildListParams(nextFilters, nextPage));

      if (requestId !== transactionsRequestId.current) {
        return;
      }

      setTransactions(data.data);
      setPagination(data.pagination);
      setPage(data.pagination.page);
    } catch (requestError) {
      if (requestId !== transactionsRequestId.current) {
        return;
      }

      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : 'Não foi possível carregar as transações agora. Tente novamente em instantes.'
      );
    } finally {
      if (requestId === transactionsRequestId.current) {
        setLoading(false);
      }
    }
  }

  async function loadSummary() {
    try {
      setSummaryLoading(true);
      const data = await getTransactionMonthSummary();
      setSummary(data);
    } catch (_error) {
      setSummary(initialSummary);
    } finally {
      setSummaryLoading(false);
    }
  }

  async function loadPageData(nextFilters = filters, nextPage = page) {
    try {
      await Promise.all([
        loadReferences(),
        loadTransactionsData(nextFilters, nextPage),
        loadSummary()
      ]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar os dados da tela de transações.');
    }
  }

  useDataInvalidation(['transactions'], async () => {
    await Promise.all([
      loadTransactionsData(filters, page),
      loadSummary()
    ]);
  });

  useEffect(() => {
    loadPageData(initialFilters, 1);
  }, []);

  useEffect(() => {
    if (location.state?.openNewTransaction) {
      setPendingNewTransaction(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (pendingNewTransaction && accounts.length > 0) {
      handleCreateClick();
      setPendingNewTransaction(false);
    }
  }, [pendingNewTransaction, accounts]);

  function handleCreateClick() {
    setSelectedTransaction(null);
    setFormVisible(true);
    setError('');
    setFormError('');
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => {
      const nextFilters = {
        ...currentFilters,
        [name]: value
      };

      if (name === 'origin') {
        if (value === 'credit_card') {
          nextFilters.accountId = '';
        } else if (value === 'account') {
          nextFilters.creditCardId = '';
        } else {
          nextFilters.accountId = '';
          nextFilters.creditCardId = '';
        }
      }

      return nextFilters;
    });
  }

  async function applyFilters() {
    setPage(1);
    await loadTransactionsData(filters, 1);
  }

  useEffect(() => {
    if (!hasInitializedFilters.current) {
      hasInitializedFilters.current = true;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      applyFilters();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  async function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    setPage(nextPage);
    await loadTransactionsData(filters, nextPage);
  }

  async function handleEdit(transaction) {
    try {
      setSaving(true);
      setError('');

      if (transaction.type === 'TRANSFER' && transaction.amount < 0) {
        const transferId = transaction.transferId || transaction.id;
        const data = await getTransfer(transferId);
        setSelectedTransfer(data);
        setTransferFormVisible(true);
        setFormError('');
      } else {
        const data = await getTransaction(transaction.id);
        setSelectedTransaction(data);
        setFormVisible(true);
        setFormError('');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Nao foi possivel carregar para edicao.');
    } finally {
      setSaving(false);
    }
  }

  function handleConfirmClick(transaction) {
    setConfirmTarget(transaction);
  }

  async function handleConfirmSubmit() {
    if (!confirmTarget) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await confirmTransaction(confirmTarget.id);
      setConfirmTarget(null);
      toast.success('Transação confirmada com sucesso.');
      publishDataMutation(DATA_MUTATIONS.TRANSACTION_CHANGED);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível confirmar a transação.');
      toast.error(requestError.response?.data?.message || 'Erro ao confirmar transação.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');

      if (selectedTransaction) {
        await updateTransaction(selectedTransaction.id, payload);
      } else {
        await createTransaction(payload);
      }

      publishDataMutation(DATA_MUTATIONS.TRANSACTION_CHANGED);

      setFormVisible(false);
      setSelectedTransaction(null);
      setFormError('');
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Nao foi possivel salvar a transacao.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTransferSubmit(payload) {
    try {
      setSaving(true);
      setFormError('');

      if (selectedTransfer) {
        await updateTransfer(selectedTransfer.transferId, payload);
      } else {
        await createTransfer(payload);
      }

      setTransferFormVisible(false);
      setSelectedTransfer(null);
      setFormError('');
      await Promise.all([
        loadTransactionsData(filters, page),
        loadSummary()
      ]);
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Nao foi possivel salvar a transferencia.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelTransferForm() {
    setTransferFormVisible(false);
    setSelectedTransfer(null);
    setFormError('');
  }

  function handleDeleteClick(transaction) {
    setDeleteTarget(transaction);
  }

  async function handleDeleteSubmit() {
    if (!deleteTarget) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (deleteTarget.type === 'TRANSFER') {
        const transferId = deleteTarget.transferId || deleteTarget.id;
        await deleteTransfer(transferId);
      } else {
        await deleteTransaction(deleteTarget.id);
        publishDataMutation(DATA_MUTATIONS.TRANSACTION_CHANGED);
      }

      if (selectedTransaction?.id === deleteTarget.id) {
        setSelectedTransaction(null);
        setFormVisible(false);
      }

      if (selectedTransfer?.transferId === (deleteTarget.transferId || deleteTarget.id)) {
        setSelectedTransfer(null);
        setTransferFormVisible(false);
      }

      setDeleteTarget(null);
      toast.success('Transacao excluida com sucesso.');
      if (deleteTarget.type === 'TRANSFER') {
        await Promise.all([
          loadTransactionsData(filters, page),
          loadSummary()
        ]);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível excluir a transação.');
      toast.error(requestError.response?.data?.message || 'Erro ao excluir transação.');
    } finally {
      setSaving(false);
    }
  }

  async function handleClearFilters() {
    const next = {
      ...initialFilters,
      startDate: getFirstDayOfMonth(),
      endDate: getLastDayOfMonth()
    };

    setFilters(next);
    setPage(1);
    await loadTransactionsData(next, 1);
  }

  const handlePeriodPreset = useCallback(async (preset) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;
    let startDate = '';
    let endDate = today;

    switch (preset) {
      case 'today':
        startDate = today;
        endDate = today;
        break;

      case 'last7': {
        const d7 = new Date(now);
        d7.setDate(d7.getDate() - 6);
        startDate = `${d7.getFullYear()}-${String(d7.getMonth() + 1).padStart(2, '0')}-${String(d7.getDate()).padStart(2, '0')}`;
        break;
      }

      case 'last30': {
        const d30 = new Date(now);
        d30.setDate(d30.getDate() - 29);
        startDate = `${d30.getFullYear()}-${String(d30.getMonth() + 1).padStart(2, '0')}-${String(d30.getDate()).padStart(2, '0')}`;
        break;
      }

      case 'thisMonth':
        startDate = getFirstDayOfMonth();
        endDate = getLastDayOfMonth();
        break;

      case 'lastMonth': {
        const firstPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastPrev = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = `${firstPrev.getFullYear()}-${String(firstPrev.getMonth() + 1).padStart(2, '0')}-01`;
        endDate = `${lastPrev.getFullYear()}-${String(lastPrev.getMonth() + 1).padStart(2, '0')}-${String(lastPrev.getDate()).padStart(2, '0')}`;
        break;
      }

      case 'last3Months': {
        const d3m = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        startDate = `${d3m.getFullYear()}-${String(d3m.getMonth() + 1).padStart(2, '0')}-01`;
        endDate = getLastDayOfMonth();
        break;
      }

      case 'thisYear':
        startDate = `${now.getFullYear()}-01-01`;
        endDate = getLastDayOfMonth();
        break;

      case 'custom':
        startDate = '';
        endDate = '';
        break;

      default:
        return;
    }

    const nextFilters = { ...filters, startDate, endDate };

    setFilters(nextFilters);
    setPage(1);
    await loadTransactionsData(nextFilters, 1);
  }, [filters]);

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedTransaction(null);
    setFormError('');
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Transações"
          description="Acompanhe receitas, despesas, investimentos e transferências."
          action={(
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              Nova transação
            </Button>
          )}
        />

        {summaryLoading ? (
          <div className="grid gap-5 md:grid-cols-2 min-[1521px]:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-36 rounded-[28px]" />)}
          </div>
        ) : (
          <TransactionSummaryCards summary={summary} />
        )}

        <TransactionFilters
          filters={filters}
          accounts={accounts}
          categories={categories.filter((category) => !filters.type || category.type === filters.type)}
          creditCards={creditCards}
          loading={loading}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          onPeriodPreset={handlePeriodPreset}
        />

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
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">Falha ao processar transações</p>
                  <p className="mt-2 text-sm text-rose-700">{error}</p>
                  <div className="mt-4">
                    <Button variant="secondary" onClick={() => loadPageData(filters, page)}>Tentar novamente</Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {!loading && !error && transactions.length === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="Nenhuma transação encontrada"
              description="Crie a primeira transação do workspace atual ou ajuste os filtros para localizar movimentações existentes."
              action={<Button onClick={handleCreateClick}>Criar transação</Button>}
            />
          ) : null}

          {!loading && !error && transactions.length > 0 ? (
            <>
              <div className="grid gap-4 min-[1521px]:hidden">
                {transactions.map((transaction) => (
                  <TransactionMobileCard key={transaction.id} transaction={transaction} loading={saving} onEdit={handleEdit} onDelete={handleDeleteClick} onConfirm={handleConfirmClick} />
                ))}
              </div>

              <div className="min-[1521px]:hidden">
                <Card className="rounded-[28px] p-4">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                    <span>Página {pagination.page} de {pagination.totalPages}</span>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm" onClick={() => handlePageChange(page - 1)} disabled={loading || page <= 1}>Anterior</Button>
                      <Button variant="secondary" size="sm" onClick={() => handlePageChange(page + 1)} disabled={loading || page >= pagination.totalPages}>Próxima</Button>
                    </div>
                  </div>
                </Card>
              </div>

              <TransactionTable
                transactions={transactions}
                pagination={pagination}
                loading={saving}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onPageChange={handlePageChange}
                onConfirm={handleConfirmClick}
              />
            </>
          ) : null}
        </div>

        <Modal
          isOpen={!!confirmTarget}
          title="Confirmar transação"
          description="Deseja realmente confirmar esta transação?"
          onClose={() => setConfirmTarget(null)}
          footer={(
            <>
              <Button type="button" variant="secondary" onClick={() => setConfirmTarget(null)}>Cancelar</Button>
              <Button type="button" disabled={saving} onClick={handleConfirmSubmit}>
                {saving ? 'Confirmando...' : 'Confirmar transação'}
              </Button>
            </>
          )}
        >
          {confirmTarget ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Descrição</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{confirmTarget.description}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Valor</span>
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(confirmTarget.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Data</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDateBR(confirmTarget.transactionDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>

        <Modal
          isOpen={!!deleteTarget}
          title="Excluir transação"
          description="Deseja realmente excluir esta transação?"
          onClose={() => setDeleteTarget(null)}
          footer={(
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" size="md" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button type="button" variant="danger" size="md" disabled={saving} onClick={handleDeleteSubmit}>
                <Trash2 className="h-4 w-4" />
                {saving ? 'Excluindo...' : 'Excluir transação'}
              </Button>
            </div>
          )}
        >
          {deleteTarget ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-900/10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Descrição</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{deleteTarget.description}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Valor</span>
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(deleteTarget.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Data</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDateBR(deleteTarget.transactionDate)}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-rose-600 dark:text-rose-400">Esta ação não poderá ser desfeita.</p>
            </div>
          ) : null}
        </Modal>

        <FormModal
          isOpen={formVisible}
          title={selectedTransaction ? 'Editar transação' : 'Nova transação'}
          onClose={handleCancelForm}
          footer={(
            <>
              <Button type="button" variant="secondary" onClick={handleCancelForm}>Cancelar</Button>
              <Button type="submit" form="transaction-form" disabled={saving}>
                {saving ? 'Salvando...' : selectedTransaction ? 'Salvar alterações' : 'Criar transação'}
              </Button>
            </>
          )}
        >
          <TransactionForm
            transaction={selectedTransaction}
            accounts={accounts}
            categories={categories}
            creditCards={creditCards}
            serverError={formError}
            onSubmit={handleSubmit}
          />
        </FormModal>

        <FormModal
          isOpen={transferFormVisible}
          title={selectedTransfer ? 'Editar transferencia' : 'Nova transferencia'}
          onClose={handleCancelTransferForm}
          maxWidth="max-w-2xl"
          footer={(
            <>
              <Button type="button" variant="secondary" onClick={handleCancelTransferForm}>Cancelar</Button>
              <Button type="submit" form="transfer-form" disabled={saving}>
                {saving ? 'Salvando...' : selectedTransfer ? 'Salvar alteracoes' : 'Transferir'}
              </Button>
            </>
          )}
        >
          <TransferForm
            transfer={selectedTransfer}
            accounts={accounts}
            serverError={formError}
            onSubmit={handleTransferSubmit}
          />
        </FormModal>
      </div>
    </AppLayout>
  );
}

export default Transactions;
