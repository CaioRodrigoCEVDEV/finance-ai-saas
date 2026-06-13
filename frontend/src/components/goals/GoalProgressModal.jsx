import { useEffect, useState } from 'react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatPercentage } from '../../utils/formatters';

function GoalProgressModal({ isOpen, goal, loading, serverError, onClose, onSubmit }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const [currentAmount, setCurrentAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (goal) {
      setCurrentAmount(String(goal.currentAmount ?? ''));
    } else {
      setCurrentAmount('');
    }
    setError('');
  }, [goal, isOpen]);

  function handleChange(event) {
    setCurrentAmount(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const value = Number(currentAmount);

    if (!Number.isFinite(value) || value < 0) {
      setError('Informe um valor valido maior ou igual a zero.');
      return;
    }

    setError('');
    await onSubmit({ currentAmount: value });
  }

  return (
    <Modal isOpen={isOpen} title="Atualizar progresso" onClose={onClose}>
      {goal ? (
        <div>
          <div className="mb-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Meta</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{goal.name}</p>
            <div className="mt-3 flex items-center gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Alvo</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatCurrencyPrivacy(goal.targetAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Atual</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatCurrencyPrivacy(goal.currentAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Progresso</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{formatPercentage(goal.progressPercentage)}</p>
              </div>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Novo valor atual"
              name="currentAmount"
              type="number"
              step="0.01"
              min="0"
              value={currentAmount}
              onChange={handleChange}
              autoFocus
            />

            {error || serverError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error || serverError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar progresso'}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            </div>
          </form>
        </div>
      ) : null}
    </Modal>
  );
}

export default GoalProgressModal;
