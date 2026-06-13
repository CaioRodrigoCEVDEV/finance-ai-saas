import { useEffect, useState } from 'react';

import Input from '../ui/Input';
import Select from '../ui/Select';

const now = new Date();

const initialFormValues = {
  name: '',
  categoryId: '',
  amount: '',
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear())
};

const monthOptions = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Marco' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
];

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear - 3; year <= currentYear + 3; year += 1) {
    years.push(String(year));
  }

  return years;
}

function buildFormValues(budget) {
  if (!budget) {
    return initialFormValues;
  }

  return {
    name: budget.name || '',
    categoryId: budget.category?.id || '',
    amount: String(budget.amount ?? ''),
    month: String(budget.month ?? now.getMonth() + 1),
    year: String(budget.year ?? now.getFullYear())
  };
}

function BudgetForm({ budget, categories, serverError, onSubmit, formId = 'budget-form' }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');
  const fieldClassName = 'h-11 py-0 text-sm';

  useEffect(() => {
    setFormValues(buildFormValues(budget));
    setError('');
  }, [budget]);

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

    if (!formValues.categoryId) {
      setError('Selecione uma categoria de despesa.');
      return;
    }

    const amount = Number(formValues.amount);
    const month = Number(formValues.month);
    const year = Number(formValues.year);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Informe um valor limite maior que zero.');
      return;
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      setError('Informe um mes valido.');
      return;
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      setError('Informe um ano valido.');
      return;
    }

    setError('');
    await onSubmit({
      name: formValues.name.trim(),
      categoryId: formValues.categoryId,
      amount,
      month,
      year
    });
  }

  const yearOptions = getYearOptions();

  return (
    <section>
      <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2">
            <Input label="Nome" name="name" value={formValues.name} onChange={handleChange} className={fieldClassName} />
          </div>

          <Select label="Categoria" name="categoryId" value={formValues.categoryId} onChange={handleChange} className={fieldClassName}>
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>

          <Input label="Valor limite" name="amount" type="number" step="0.01" min="0" value={formValues.amount} onChange={handleChange} className={fieldClassName} />

          <Select label="Mês" name="month" value={formValues.month} onChange={handleChange} className={fieldClassName}>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Ano" name="year" value={formValues.year} onChange={handleChange} className={fieldClassName}>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
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

export default BudgetForm;
