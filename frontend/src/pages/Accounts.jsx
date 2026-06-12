import { useEffect, useState } from 'react';
import { AlertCircle, Plus, WalletCards } from 'lucide-react';

import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import {
  createAccount,
  deleteAccount,
  getAccount,
  getAccounts,
  updateAccount
} from '../services/accountService';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError('');
      const data = await getAccounts();
      setAccounts(data);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : 'Não foi possível carregar suas contas agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  function handleCreateClick() {
    setSelectedAccount(null);
    setFormVisible(true);
    setError('');
  }

  async function handleEdit(account) {
    try {
      setSaving(true);
      setError('');
      const data = await getAccount(account.id);
      setSelectedAccount(data);
      setFormVisible(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar a conta para edição.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');

      if (selectedAccount) {
        await updateAccount(selectedAccount.id, payload);
      } else {
        await createAccount(payload);
      }

      setFormVisible(false);
      setSelectedAccount(null);
      await loadAccounts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível salvar a conta.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(account) {
    const confirmed = window.confirm(`Deseja realmente excluir a conta "${account.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await deleteAccount(account.id);

      if (selectedAccount?.id === account.id) {
        setSelectedAccount(null);
        setFormVisible(false);
      }

      await loadAccounts();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível excluir a conta.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedAccount(null);
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Contas financeiras"
          description="Organize saldo, instituições e status das contas do workspace atual em um único painel, com formulário em modal e visual consistente."
          action={(
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              Nova conta
            </Button>
          )}
        />

        <div className="space-y-6">
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-64 rounded-[28px]" />)}
              </div>
            ) : null}

            {!loading && error ? (
              <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-900">Falha ao processar contas</p>
                    <p className="mt-2 text-sm text-rose-700">{error}</p>
                  </div>
                </div>
              </Card>
            ) : null}

            {!loading && !error && accounts.length === 0 ? (
              <EmptyState
                icon={WalletCards}
                title="Nenhuma conta cadastrada"
                description="Crie a primeira conta financeira deste workspace para acompanhar os saldos com a nova interface premium."
                action={<Button onClick={handleCreateClick}>Criar primeira conta</Button>}
              />
            ) : null}

            {!loading && accounts.length > 0 ? (
              <div className="grid gap-6 xl:grid-cols-2">
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : null}
        </div>

        <Modal isOpen={formVisible} title={selectedAccount ? 'Editar conta' : 'Nova conta'} onClose={handleCancelForm}>
          <AccountForm account={selectedAccount} loading={saving} onCancel={handleCancelForm} onSubmit={handleSubmit} />
        </Modal>
      </div>
    </AppLayout>
  );
}

export default Accounts;
