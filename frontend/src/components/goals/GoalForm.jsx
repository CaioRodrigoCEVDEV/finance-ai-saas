import { useEffect, useRef, useState } from 'react';

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

function GoalForm({ goal, onSubmit, formId = 'goal-form' }) {
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const fieldClassName = 'h-11 py-0 text-sm';

  useEffect(() => {
    setFormValues(buildFormValues(goal));
    setErrors({});
  }, [goal]);

  function handleChange(event) {
    const { name, value } = event.target;

    setErrors((prev) => ({ ...prev, [name]: '' }));

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  }

  function scrollToFirstError() {
    if (!formRef.current) {
      return;
    }

    const firstError = formRef.current.querySelector('[data-error="true"]');

    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (formValues.name.trim().length < 2) {
      nextErrors.name = 'Informe um nome com pelo menos 2 caracteres.';
    }

    const targetAmount = Number(formValues.targetAmount);

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      nextErrors.targetAmount = 'Informe um valor alvo maior que zero.';
    }

    const currentAmount = Number(formValues.currentAmount || 0);

    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
      nextErrors.currentAmount = 'Valor atual nao pode ser negativo.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError();
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

    await onSubmit(payload);
  }

  return (
    <section>
      <form ref={formRef} id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2">
            <Input label="Nome" name="name" error={errors.name} value={formValues.name} onChange={handleChange} className={fieldClassName} />
          </div>

          <div className="md:col-span-2">
            <Input label="Descricao" name="description" value={formValues.description} onChange={handleChange} className={fieldClassName} />
          </div>

          <Input label="Valor alvo" name="targetAmount" type="number" step="0.01" min="0" error={errors.targetAmount} value={formValues.targetAmount} onChange={handleChange} className={fieldClassName} />
          <Input label="Valor atual" name="currentAmount" type="number" step="0.01" min="0" error={errors.currentAmount} value={formValues.currentAmount} onChange={handleChange} className={fieldClassName} />
          <Input label="Prazo" name="deadline" type="date" value={formValues.deadline} onChange={handleChange} className={fieldClassName} />
          <Select label="Status" name="status" value={formValues.status} onChange={handleChange} className={fieldClassName}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>
      </form>
    </section>
  );
}

export default GoalForm;
