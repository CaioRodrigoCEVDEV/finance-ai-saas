import { useEffect, useState } from 'react';

import FormModal from '../../ui/FormModal';
import Button from '../../ui/Button';
import LoadingSkeleton from '../../ui/LoadingSkeleton';
import TransferForm from '../../transfers/TransferForm';
import { getAccounts } from '../../../services/accountService';
import { createTransfer } from '../../../services/transferService';
import { useToast } from '../../../contexts/ToastContext';
import { DATA_MUTATIONS, publishDataMutation } from '../../../utils/dataInvalidation';

function QuickTransferFlow({ onBack, onClose }) {
  const toast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const accountData = await getAccounts();
        if (!isMounted) return;
        setAccounts(accountData);
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.response?.data?.message || 'Erro ao carregar contas.');
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
      await createTransfer(payload);
      publishDataMutation(DATA_MUTATIONS.TRANSFER_CREATED);
      toast.success('Transferência criada com sucesso.');
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Erro ao criar transferencia.');
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
        </div>
      );
    }

    if (error && !saving) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      );
    }

    return (
      <TransferForm
        accounts={accounts}
        serverError={error}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <FormModal
      isOpen
      eyebrow="TRANSFERENCIA"
      title="Transferencia entre contas"
      onClose={onBack}
      maxWidth="max-w-2xl"
      className="sm:max-w-2xl"
      fullScreenOnMobile
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onBack} disabled={saving}>
            Voltar
          </Button>
          <Button type="submit" form="transfer-form" disabled={saving || loading}>
            {saving ? 'Salvando...' : 'Transferir'}
          </Button>
        </>
      )}
    >
      {renderForm()}
    </FormModal>
  );
}

export default QuickTransferFlow;
