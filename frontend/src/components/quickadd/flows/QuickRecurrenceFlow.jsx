import { useEffect, useState } from 'react';

import FormModal from '../../ui/FormModal';
import Button from '../../ui/Button';
import LoadingSkeleton from '../../ui/LoadingSkeleton';
import RecurrenceForm from '../../recurrences/RecurrenceForm';
import { getAccounts } from '../../../services/accountService';
import { getCategories } from '../../../services/categoryService';
import { getCreditCards } from '../../../services/creditCardService';
import { createRecurrence } from '../../../services/recurrenceService';

function QuickRecurrenceFlow({ onBack, onClose }) {
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
      await createRecurrence(payload);
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Erro ao criar recorrência.');
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

    return (
      <RecurrenceForm
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
      eyebrow="NOVA RECORRÊNCIA"
      title="Cadastre um lançamento automático"
      onClose={onBack}
      maxWidth="max-w-4xl"
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onBack} disabled={saving}>
            Voltar
          </Button>
          <Button type="submit" form="recurrence-form" disabled={saving || loading}>
            {saving ? 'Salvando...' : 'Criar recorrência'}
          </Button>
        </>
      )}
    >
      {renderForm()}
    </FormModal>
  );
}

export default QuickRecurrenceFlow;
