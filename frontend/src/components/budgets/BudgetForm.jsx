import { useEffect, useState } from 'react';

import Button from '../ui/Button';
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

function BudgetForm({ budget, categories, loading, serverError, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');

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
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">{budget ? 'Editar orçamento' : 'Novo orçamento'}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {budget ? 'Atualize o limite mensal da categoria' : 'Defina um teto mensal para controlar seus gastos'}
        </h2>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Nome" name="name" value={formValues.name} onChange={handleChange} />
          </div>

          <Select label="Categoria" name="categoryId" value={formValues.categoryId} onChange={handleChange}>
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>

          <Input label="Valor limite" name="amount" type="number" step="0.01" min="0" value={formValues.amount} onChange={handleChange} />

          <Select label="Mês" name="month" value={formValues.month} onChange={handleChange}>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Ano" name="year" value={formValues.year} onChange={handleChange}>
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

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : budget ? 'Salvar alterações' : 'Criar orçamento'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </section>
  );
}

export default BudgetForm;
