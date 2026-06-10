import { useEffect, useState } from 'react';

import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import MainLayout from '../layouts/MainLayout';
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
          ? 'Sua sessao expirou. Entre novamente para continuar.'
          : 'Nao foi possivel carregar suas contas agora. Tente novamente em instantes.'
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
      setError(requestError.response?.data?.message || 'Nao foi possivel carregar a conta para edicao.');
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
      setError(requestError.response?.data?.message || 'Nao foi possivel salvar a conta.');
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
      setError(requestError.response?.data?.message || 'Nao foi possivel excluir a conta.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedAccount(null);
  }

  return (
    <MainLayout>
      <header className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-sm">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-sky-300">
              Gestao financeira
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Contas financeiras</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-300">
              Organize saldo, instituicoes e status das contas do tenant atual em um unico painel.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateClick}
            className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Nova conta
          </button>
        </div>
      </header>

      <main className="py-10">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
                <p className="text-lg font-medium text-white">Carregando contas...</p>
                <p className="mt-2 text-sm text-slate-400">Buscando contas ativas do tenant autenticado.</p>
              </div>
            ) : null}

            {!loading && error ? (
              <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6">
                <p className="text-lg font-medium text-white">Falha ao processar contas</p>
                <p className="mt-2 text-sm text-rose-100">{error}</p>
              </div>
            ) : null}

            {!loading && !error && accounts.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
                <p className="text-xl font-semibold text-white">Nenhuma conta cadastrada</p>
                <p className="mt-2 text-sm text-slate-400">Crie a primeira conta financeira deste tenant para acompanhar os saldos.</p>
              </div>
            ) : null}

            {!loading && accounts.length > 0 ? (
              <div className="grid gap-6">
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
          </section>

          <aside>
            {formVisible ? (
              <AccountForm
                account={selectedAccount}
                loading={saving}
                onCancel={handleCancelForm}
                onSubmit={handleSubmit}
              />
            ) : (
              <section className="rounded-[32px] border border-dashed border-slate-700 bg-slate-900/50 p-8 text-slate-300">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Painel rapido</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Crie e atualize contas sem sair da lista</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Use o botao <span className="font-medium text-slate-200">Nova conta</span> para cadastrar uma conta ou clique em editar em qualquer card para ajustar seus dados.
                </p>
              </section>
            )}
          </aside>
        </div>
      </main>
    </MainLayout>
  );
}

export default Accounts;
