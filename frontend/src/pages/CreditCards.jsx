import { useEffect, useState } from 'react';
import { AlertCircle, CreditCard as CreditCardIcon, Plus } from 'lucide-react';

import CreditCardCard from '../components/creditCards/CreditCardCard';
import CreditCardForm from '../components/creditCards/CreditCardForm';
import CreditCardSummary from '../components/creditCards/CreditCardSummary';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { getAccounts } from '../services/accountService';
import {
  createCreditCard,
  deleteCreditCard,
  getCreditCard,
  getCreditCards,
  updateCreditCard
} from '../services/creditCardService';

function CreditCards() {
  const [creditCards, setCreditCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedCreditCard, setSelectedCreditCard] = useState(null);

  async function loadCreditCards() {
    try {
      setLoading(true);
      setError('');
      const data = await getCreditCards();
      setCreditCards(data);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessao expirou. Entre novamente para continuar.'
          : 'Nao foi possivel carregar seus cartoes agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      setAccountsLoading(true);
      const data = await getAccounts();
      setAccounts(data);
    } catch (_requestError) {
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  }

  async function loadPageData() {
    await Promise.all([loadCreditCards(), loadAccounts()]);
  }

  useEffect(() => {
    loadPageData();
  }, []);

  function handleCreateClick() {
    setSelectedCreditCard(null);
    setFormVisible(true);
    setFormError('');
    setError('');
  }

  async function handleEdit(creditCard) {
    try {
      setSaving(true);
      setError('');
      setFormError('');
      const data = await getCreditCard(creditCard.id);
      setSelectedCreditCard(data);
      setFormVisible(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Nao foi possivel carregar o cartao para edicao.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setFormError('');
      setError('');

      if (selectedCreditCard) {
        await updateCreditCard(selectedCreditCard.id, payload);
      } else {
        await createCreditCard(payload);
      }

      setFormVisible(false);
      setSelectedCreditCard(null);
      await loadCreditCards();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Nao foi possivel salvar o cartao.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(creditCard) {
    const confirmed = window.confirm(`Deseja realmente excluir o cartao "${creditCard.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await deleteCreditCard(creditCard.id);

      if (selectedCreditCard?.id === creditCard.id) {
        setSelectedCreditCard(null);
        setFormVisible(false);
      }

      await loadCreditCards();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Nao foi possivel excluir o cartao.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedCreditCard(null);
    setFormError('');
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Cartoes de credito"
          description="Gerencie limites, vencimentos e gastos dos seus cartoes."
          action={(
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              Novo cartao
            </Button>
          )}
        />

        {!loading ? <CreditCardSummary cards={creditCards} /> : null}

        <div className="space-y-6">
          {loading ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-36 rounded-[28px]" />)}
              </div>
              <div className="grid gap-6 xl:grid-cols-2">
                {[1, 2, 3, 4].map((item) => <LoadingSkeleton key={item} className="h-80 rounded-[32px]" />)}
              </div>
            </>
          ) : null}

          {!loading && error ? (
            <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">Falha ao processar cartoes</p>
                  <p className="mt-2 text-sm text-rose-700">{error}</p>
                  <div className="mt-4">
                    <Button variant="secondary" onClick={loadPageData}>Tentar novamente</Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {!loading && !error && creditCards.length === 0 ? (
            <EmptyState
              icon={CreditCardIcon}
              title="Nenhum cartao cadastrado"
              description="Crie o primeiro cartao do tenant atual para acompanhar limite, fechamento e consumo mensal em um painel premium."
              action={<Button onClick={handleCreateClick}>Criar primeiro cartao</Button>}
            />
          ) : null}

          {!loading && !error && creditCards.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {creditCards.map((creditCard) => (
                <CreditCardCard
                  key={creditCard.id}
                  creditCard={creditCard}
                  loading={saving}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : null}
        </div>

        <Modal isOpen={formVisible} title={selectedCreditCard ? 'Editar cartao' : 'Novo cartao'} onClose={handleCancelForm}>
          <CreditCardForm
            creditCard={selectedCreditCard}
            accounts={accounts}
            loadingAccounts={accountsLoading}
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

export default CreditCards;
