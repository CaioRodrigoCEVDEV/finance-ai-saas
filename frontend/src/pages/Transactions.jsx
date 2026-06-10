import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeftRight, Plus } from 'lucide-react';

import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionMobileCard from '../components/transactions/TransactionMobileCard';
import TransactionSummaryCards from '../components/transactions/TransactionSummaryCards';
import TransactionTable from '../components/transactions/TransactionTable';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { getAccounts } from '../services/accountService';
import { getCategories } from '../services/categoryService';
import { getCreditCards } from '../services/creditCardService';
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  getTransactionMonthSummary,
  getTransactions,
  updateTransaction
} from '../services/transactionService';

const initialFilters = {
  search: '',
  type: '',
  status: '',
  accountId: '',
  categoryId: '',
  startDate: '',
  endDate: ''
};

const initialSummary = {
  month: null,
  year: null,
  income: 0,
  expense: 0,
  investment: 0,
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
    try {
      setLoading(true);
      setError('');

      const data = await getTransactions(buildListParams(nextFilters, nextPage));

      setTransactions(data.data);
      setPagination(data.pagination);
      setPage(data.pagination.page);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessao expirou. Entre novamente para continuar.'
          : 'Nao foi possivel carregar as transacoes agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
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
      setError(requestError.response?.data?.message || 'Nao foi possivel carregar os dados da tela de transacoes.');
    }
  }

  useEffect(() => {
    loadPageData(initialFilters, 1);
  }, []);

  function handleCreateClick() {
    setSelectedTransaction(null);
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
      const data = await getTransaction(transaction.id);
      setSelectedTransaction(data);
      setFormVisible(true);
      setFormError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Nao foi possivel carregar a transacao para edicao.');
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

      setFormVisible(false);
      setSelectedTransaction(null);
      setFormError('');
      await Promise.all([
        loadTransactionsData(filters, page),
        loadSummary()
      ]);
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Nao foi possivel salvar a transacao.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(transaction) {
    const confirmed = window.confirm(`Deseja realmente excluir a transacao "${transaction.description}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await deleteTransaction(transaction.id);

      if (selectedTransaction?.id === transaction.id) {
        setSelectedTransaction(null);
        setFormVisible(false);
      }

      await Promise.all([
        loadTransactionsData(filters, page),
        loadSummary()
      ]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Nao foi possivel excluir a transacao.');
    } finally {
      setSaving(false);
    }
  }

  async function handleClearFilters() {
    setFilters(initialFilters);
    setPage(1);
    await loadTransactionsData(initialFilters, 1);
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedTransaction(null);
    setFormError('');
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Transacoes"
          description="Acompanhe receitas, despesas, investimentos e transferencias."
          action={(
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              Nova transacao
            </Button>
          )}
        />

        {summaryLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-36 rounded-[28px]" />)}
          </div>
        ) : (
          <TransactionSummaryCards summary={summary} />
        )}

        <TransactionFilters
          filters={filters}
          accounts={accounts}
          categories={categories.filter((category) => !filters.type || category.type === filters.type)}
          loading={loading}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
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
                  <p className="text-lg font-medium text-slate-900">Falha ao processar transacoes</p>
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
              title="Nenhuma transacao encontrada"
              description="Crie a primeira transacao do tenant atual ou ajuste os filtros para localizar movimentacoes existentes."
              action={<Button onClick={handleCreateClick}>Criar transacao</Button>}
            />
          ) : null}

          {!loading && !error && transactions.length > 0 ? (
            <>
              <div className="grid gap-4 lg:hidden">
                {transactions.map((transaction) => (
                  <TransactionMobileCard key={transaction.id} transaction={transaction} loading={saving} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>

              <div className="lg:hidden">
                <Card className="rounded-[28px] p-4">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                    <span>Pagina {pagination.page} de {pagination.totalPages}</span>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm" onClick={() => handlePageChange(page - 1)} disabled={loading || page <= 1}>Anterior</Button>
                      <Button variant="secondary" size="sm" onClick={() => handlePageChange(page + 1)} disabled={loading || page >= pagination.totalPages}>Proxima</Button>
                    </div>
                  </div>
                </Card>
              </div>

              <TransactionTable
                transactions={transactions}
                pagination={pagination}
                loading={saving}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPageChange={handlePageChange}
              />
            </>
          ) : null}
        </div>

        <Modal isOpen={formVisible} title={selectedTransaction ? 'Editar transacao' : 'Nova transacao'} onClose={handleCancelForm}>
          <TransactionForm
            transaction={selectedTransaction}
            accounts={accounts}
            categories={categories}
            creditCards={creditCards}
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

export default Transactions;
