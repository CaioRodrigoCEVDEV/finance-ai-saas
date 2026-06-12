import { useEffect, useState } from 'react';

import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const TYPE_OPTIONS = [
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' }
];

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Diaria' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'BIWEEKLY', label: 'Quinzenal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'BIMONTHLY', label: 'Bimestral' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUAL', label: 'Semestral' },
  { value: 'YEARLY', label: 'Anual' }
];

const initialFormValues = {
  description: '',
  amount: '',
  type: 'EXPENSE',
  frequency: 'MONTHLY',
  startDate: new Date().toISOString().slice(0, 10),
  nextRunDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  accountId: '',
  creditCardId: '',
  categoryId: '',
  paymentMethod: '',
  notes: '',
  autoGenerate: false,
  generateAsPaid: false
};

function buildFormValues(recurrence) {
  if (!recurrence) {
    return initialFormValues;
  }

  return {
    description: recurrence.description || '',
    amount: String(recurrence.amount ?? ''),
    type: recurrence.type || 'EXPENSE',
    frequency: recurrence.frequency || 'MONTHLY',
    startDate: recurrence.startDate ? recurrence.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    nextRunDate: recurrence.nextRunDate ? recurrence.nextRunDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    endDate: recurrence.endDate ? recurrence.endDate.slice(0, 10) : '',
    accountId: recurrence.account?.id || '',
    creditCardId: recurrence.creditCard?.id || '',
    categoryId: recurrence.category?.id || '',
    paymentMethod: recurrence.paymentMethod || '',
    notes: recurrence.notes || '',
    autoGenerate: recurrence.autoGenerate ?? false,
    generateAsPaid: recurrence.generateAsPaid ?? false
  };
}

function RecurrenceForm({ recurrence, accounts, categories, creditCards, loading, serverError, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormValues(buildFormValues(recurrence));
    setError('');
  }, [recurrence]);

  const filteredCategories = categories.filter((category) => category.type === formValues.type);
  const isIncome = formValues.type === 'INCOME';

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormValues((currentValues) => {
      const nextValues = {
        ...currentValues,
        [name]: nextValue
      };

      if (name === 'type' && nextValue === 'INCOME') {
        nextValues.creditCardId = '';
      }

      if (name === 'accountId' && nextValue) {
        nextValues.creditCardId = '';
      }

      if (name === 'creditCardId' && nextValue) {
        nextValues.accountId = '';
      }

      return nextValues;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formValues.description.trim().length < 2) {
      setError('Informe uma descrição com pelo menos 2 caracteres.');
      return;
    }

    const amount = Number(formValues.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Informe um valor positivo valido.');
      return;
    }

    if (!formValues.startDate) {
      setError('Informe a data inicial.');
      return;
    }

    if (!formValues.nextRunDate) {
      setError('Informe a data da proxima geracao.');
      return;
    }

    if (formValues.endDate && formValues.endDate < formValues.startDate) {
      setError('A data final deve ser maior ou igual a data inicial.');
      return;
    }

    if (formValues.accountId && formValues.creditCardId) {
      setError('Informe apenas uma conta ou um cartão de crédito, não ambos.');
      return;
    }

    const payload = {
      description: formValues.description.trim(),
      amount,
      type: formValues.type,
      frequency: formValues.frequency,
      startDate: formValues.startDate,
      nextRunDate: formValues.nextRunDate,
      endDate: formValues.endDate || null,
      accountId: formValues.accountId || null,
      creditCardId: formValues.creditCardId || null,
      categoryId: formValues.categoryId || null,
      paymentMethod: formValues.paymentMethod || null,
      notes: formValues.notes.trim() || null,
      autoGenerate: formValues.autoGenerate,
      generateAsPaid: formValues.generateAsPaid
    };

    setError('');
    await onSubmit(payload);
  }

  return (
    <section>
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">{recurrence ? 'Editar recorrência' : 'Nova recorrência'}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {recurrence ? 'Atualize os dados da recorrência' : 'Cadastre uma nova recorrência financeira'}
        </h2>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Descricao" name="description" value={formValues.description} onChange={handleChange} />
          </div>

          <Input label="Valor" name="amount" type="number" step="0.01" min="0" value={formValues.amount} onChange={handleChange} />

          <Select label="Frequencia" name="frequency" value={formValues.frequency} onChange={handleChange}>
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Tipo" name="type" value={formValues.type} onChange={handleChange}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Input label="Data inicial" name="startDate" type="date" value={formValues.startDate} onChange={handleChange} />

          <Input label="Proxima geracao" name="nextRunDate" type="date" value={formValues.nextRunDate} onChange={handleChange} />

          <Input label="Data final" name="endDate" type="date" value={formValues.endDate} onChange={handleChange} />

          <Select label="Categoria" name="categoryId" value={formValues.categoryId} onChange={handleChange}>
            <option value="">Selecione uma categoria</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>

          <Select label="Forma de pagamento" name="paymentMethod" value={formValues.paymentMethod} onChange={handleChange}>
            <option value="">Nao informado</option>
            <option value="PIX">Pix</option>
            <option value="DEBIT_CARD">Cartao de débito</option>
            <option value="CREDIT_CARD">Cartao de crédito</option>
            <option value="CASH">Dinheiro</option>
            <option value="BANK_SLIP">Boleto</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="OTHER">Outro</option>
          </Select>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className={cn('rounded-[24px] border p-4 transition', formValues.creditCardId ? 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50' : 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-900/30')}>
            <Select label="Conta" name="accountId" value={formValues.accountId} onChange={handleChange}>
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </Select>
          </div>

          <div className={cn('rounded-[24px] border p-4 transition', isIncome ? 'border-slate-200 bg-slate-50 opacity-50 dark:border-slate-600 dark:bg-slate-800/50' : formValues.creditCardId ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-900/30' : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50')}>
            <Select label="Cartao de crédito" name="creditCardId" value={formValues.creditCardId} onChange={handleChange} disabled={isIncome || !creditCards.length}>
              <option value="">{creditCards.length ? 'Selecione um cartão' : (isIncome ? 'Nao disponivel para receitas' : 'Nenhum cartão disponivel')}</option>
              {creditCards.map((creditCard) => (
                <option key={creditCard.id} value={creditCard.id}>{creditCard.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Observações</span>
          <textarea
            name="notes"
            rows="4"
            value={formValues.notes}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
            placeholder="Detalhes adicionais sobre a recorrência"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
            <input name="autoGenerate" type="checkbox" checked={formValues.autoGenerate} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
            Geracao automatica
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
            <input name="generateAsPaid" type="checkbox" checked={formValues.generateAsPaid} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
            Gerar como pago
          </label>
        </div>

        {error || serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error || serverError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : recurrence ? 'Salvar alterações' : 'Criar recorrência'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </section>
  );
}

export default RecurrenceForm;
