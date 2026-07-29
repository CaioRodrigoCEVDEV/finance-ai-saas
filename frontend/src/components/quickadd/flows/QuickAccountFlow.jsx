import { useState } from 'react';

import AccountForm from '../../accounts/AccountForm';
import Button from '../../ui/Button';
import FormModal from '../../ui/FormModal';
import { useToast } from '../../../contexts/ToastContext';
import { createAccount } from '../../../services/accountService';
import { DATA_MUTATIONS, publishDataMutation } from '../../../utils/dataInvalidation';

function QuickAccountFlow({ onBack, onClose }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');
      await createAccount(payload);
      publishDataMutation(DATA_MUTATIONS.ACCOUNT_CREATED);
      toast.success('Conta criada com sucesso.');
      onClose();
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Não foi possível criar a conta.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal
      isOpen
      eyebrow="NOVA CONTA"
      title="Cadastre uma nova conta financeira"
      onClose={onBack}
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onBack} disabled={saving}>
            Voltar
          </Button>
          <Button type="submit" form="quick-account-form" disabled={saving}>
            {saving ? 'Salvando...' : 'Criar conta'}
          </Button>
        </>
      )}
    >
      {error ? (
        <div className="mb-4 rounded-[14px] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}
      <AccountForm formId="quick-account-form" onSubmit={handleSubmit} />
    </FormModal>
  );
}

export default QuickAccountFlow;
