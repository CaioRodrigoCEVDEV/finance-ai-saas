import { useEffect, useState } from 'react';

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

function GoalForm({ goal, serverError, onSubmit, formId = 'goal-form' }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');
  const fieldClassName = 'h-11 py-0 text-sm';

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
      setError('Valor atual não pode ser negativo.');
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
      <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2">
            <Input label="Nome" name="name" value={formValues.name} onChange={handleChange} className={fieldClassName} />
          </div>

          <div className="md:col-span-2">
            <Input label="Descrição" name="description" value={formValues.description} onChange={handleChange} className={fieldClassName} />
          </div>

          <Input label="Valor alvo" name="targetAmount" type="number" step="0.01" min="0" value={formValues.targetAmount} onChange={handleChange} className={fieldClassName} />
          <Input label="Valor atual" name="currentAmount" type="number" step="0.01" min="0" value={formValues.currentAmount} onChange={handleChange} className={fieldClassName} />
          <Input label="Prazo" name="deadline" type="date" value={formValues.deadline} onChange={handleChange} className={fieldClassName} />
          <Select label="Status" name="status" value={formValues.status} onChange={handleChange} className={fieldClassName}>
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

      </form>
    </section>
  );
}

export default GoalForm;
