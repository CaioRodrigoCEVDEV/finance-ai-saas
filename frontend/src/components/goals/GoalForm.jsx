import { useEffect, useState } from 'react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const initialFormValues = {
  name: '',
  description: '',
  targetAmount: '',
  currentAmount: '',
  deadline: '',
  status: 'ACTIVE'
};

const statusOptions = [
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'COMPLETED', label: 'Concluida' },
  { value: 'CANCELED', label: 'Cancelada' }
];

function buildFormValues(goal) {
  if (!goal) {
    return initialFormValues;
  }

  return {
    name: goal.name || '',
    description: goal.description || '',
    targetAmount: String(goal.targetAmount ?? ''),
    currentAmount: String(goal.currentAmount ?? ''),
    deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
    status: goal.status || 'ACTIVE'
  };
}

function GoalForm({ goal, loading, serverError, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormValues(buildFormValues(goal));
    setError('');
  }, [goal]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formValues.name.trim().length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }

    const targetAmount = Number(formValues.targetAmount);

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError('Informe um valor alvo maior que zero.');
      return;
    }

    const currentAmount = Number(formValues.currentAmount || 0);

    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
      setError('Valor atual nao pode ser negativo.');
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      description: formValues.description.trim() || undefined,
      targetAmount,
      currentAmount,
      status: formValues.status || 'ACTIVE'
    };

    if (formValues.deadline) {
      payload.deadline = formValues.deadline;
    }

    setError('');
    await onSubmit(payload);
  }

  return (
    <section>
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">{goal ? 'Editar meta' : 'Nova meta'}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          {goal ? 'Atualize os dados da meta financeira' : 'Defina um objetivo financeiro e acompanhe seu progresso'}
        </h2>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Nome" name="name" value={formValues.name} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <Input label="Descricao" name="description" value={formValues.description} onChange={handleChange} />
          </div>

          <Input label="Valor alvo" name="targetAmount" type="number" step="0.01" min="0" value={formValues.targetAmount} onChange={handleChange} />
          <Input label="Valor atual" name="currentAmount" type="number" step="0.01" min="0" value={formValues.currentAmount} onChange={handleChange} />
          <Input label="Prazo" name="deadline" type="date" value={formValues.deadline} onChange={handleChange} />
          <Select label="Status" name="status" value={formValues.status} onChange={handleChange}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>

        {error || serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error || serverError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : goal ? 'Salvar alteracoes' : 'Criar meta'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </section>
  );
}

export default GoalForm;
