import { useState } from 'react';

import FormModal from '../../ui/FormModal';
import Button from '../../ui/Button';
import GoalForm from '../../goals/GoalForm';
import { createGoal } from '../../../services/goalService';
import { useToast } from '../../../contexts/ToastContext';
import { DATA_MUTATIONS, publishDataMutation } from '../../../utils/dataInvalidation';

function QuickGoalFlow({ onBack, onClose }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');
      await createGoal(payload);
      publishDataMutation(DATA_MUTATIONS.GOAL_CREATED);
      toast.success('Meta criada com sucesso.');
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Erro ao criar meta.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal
      isOpen
      eyebrow="NOVA META"
      title="Cadastre uma nova meta financeira"
      onClose={onBack}
      maxWidth="max-w-2xl"
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onBack} disabled={saving}>
            Voltar
          </Button>
          <Button type="submit" form="goal-form" disabled={saving}>
            {saving ? 'Salvando...' : 'Criar meta'}
          </Button>
        </>
      )}
    >
      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <GoalForm
        onSubmit={handleSubmit}
      />
    </FormModal>
  );
}

export default QuickGoalFlow;
