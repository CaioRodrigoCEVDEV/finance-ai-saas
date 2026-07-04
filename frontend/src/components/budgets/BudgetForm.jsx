import { useEffect, useRef, useState } from 'react';

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

function BudgetForm({ budget, categories, onSubmit, formId = 'budget-form' }) {
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const fieldClassName = 'h-11 py-0 text-sm';

  useEffect(() => {
    setFormValues(buildFormValues(budget));
    setErrors({});
  }, [budget]);

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

    if (!formValues.categoryId) {
      nextErrors.categoryId = 'Selecione uma categoria de despesa.';
    }

    const amount = Number(formValues.amount);
    const month = Number(formValues.month);
    const year = Number(formValues.year);

    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = 'Informe um valor limite maior que zero.';
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      nextErrors.month = 'Informe um mes valido.';
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      nextErrors.year = 'Informe um ano valido.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError();
      return;
    }

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
      <form ref={formRef} id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2">
            <Input label="Nome" name="name" error={errors.name} value={formValues.name} onChange={handleChange} className={fieldClassName} />
          </div>

          <Select label="Categoria" name="categoryId" error={errors.categoryId} value={formValues.categoryId} onChange={handleChange} className={fieldClassName}>
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>

          <Input label="Valor limite" name="amount" type="number" step="0.01" min="0" error={errors.amount} value={formValues.amount} onChange={handleChange} className={fieldClassName} />

          <Select label="Mes" name="month" error={errors.month} value={formValues.month} onChange={handleChange} className={fieldClassName}>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Ano" name="year" error={errors.year} value={formValues.year} onChange={handleChange} className={fieldClassName}>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
        </div>
      </form>
    </section>
  );
}

export default BudgetForm;
