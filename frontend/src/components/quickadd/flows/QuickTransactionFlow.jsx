import { useEffect, useState } from 'react';

import FormModal from '../../ui/FormModal';
import Button from '../../ui/Button';
import LoadingSkeleton from '../../ui/LoadingSkeleton';
import TransactionForm from '../../transactions/TransactionForm';
import { getAccounts } from '../../../services/accountService';
import { getCategories } from '../../../services/categoryService';
import { getCreditCards } from '../../../services/creditCardService';
import { createTransaction } from '../../../services/transactionService';
import { useToast } from '../../../contexts/ToastContext';
import { DATA_MUTATIONS, publishDataMutation } from '../../../utils/dataInvalidation';

const FLOW_CONFIG = {
  INCOME: { eyebrow: 'NOVA RECEITA', title: 'Cadastre uma nova receita', defaults: { type: 'INCOME', status: 'CONFIRMED' } },
  EXPENSE: { eyebrow: 'NOVA DESPESA', title: 'Registre uma nova despesa', defaults: { type: 'EXPENSE', status: 'CONFIRMED' } },
  CREDIT_CARD: { eyebrow: 'GASTO NO CARTÃO', title: 'Lançamento no cartão de crédito', defaults: { type: 'EXPENSE', status: 'CONFIRMED', paymentMethod: 'CREDIT_CARD' } },
  TRANSFER: { eyebrow: 'TRANSFERÊNCIA', title: 'Transferência entre contas', defaults: { type: 'TRANSFER', status: 'CONFIRMED', paymentMethod: 'TRANSFER' } },
};

function QuickTransactionFlow({ flowId, onBack, onClose }) {
  const toast = useToast();
  const config = FLOW_CONFIG[flowId] || FLOW_CONFIG.EXPENSE;
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [accountData, categoryData, creditCardData] = await Promise.all([
          getAccounts(),
          getCategories({ includeInactive: false }),
          getCreditCards()
        ]);
        if (!isMounted) return;
        setAccounts(accountData);
        setCategories(categoryData);
        setCreditCards(creditCardData);
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.response?.data?.message || 'Erro ao carregar dados.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, []);

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');
      await createTransaction(payload);
      publishDataMutation(DATA_MUTATIONS.TRANSACTION_CREATED, { transactionType: payload.type });
      toast.success('Lançamento criado com sucesso.');
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Erro ao criar transação.');
    } finally {
      setSaving(false);
    }
  }

  function renderForm() {
    if (loading) {
      return (
        <div className="space-y-4">
          <LoadingSkeleton className="h-11 rounded-2xl" />
          <LoadingSkeleton className="h-11 rounded-2xl" />
          <LoadingSkeleton className="h-11 rounded-2xl" />
          <LoadingSkeleton className="h-11 rounded-2xl" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      );
    }

    return (
      <TransactionForm
        transaction={config.defaults}
        accounts={accounts}
        categories={categories}
        creditCards={creditCards}
        serverError={error}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <FormModal
      isOpen
      eyebrow={config.eyebrow}
      title={config.title}
      onClose={onBack}
      maxWidth="max-w-4xl"
      className="sm:max-w-4xl"
      fullScreenOnMobile
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onBack} disabled={saving}>
            Voltar
          </Button>
          <Button type="submit" form="transaction-form" disabled={saving || loading}>
            {saving ? 'Salvando...' : 'Criar'}
          </Button>
        </>
      )}
    >
      {renderForm()}
    </FormModal>
  );
}

export { FLOW_CONFIG };
export default QuickTransactionFlow;
