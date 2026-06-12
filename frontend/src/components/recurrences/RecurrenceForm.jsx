import { useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';

import { cn } from '../../utils/cn';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const TYPE_OPTIONS = [
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' }
];

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Diária' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'BIWEEKLY', label: 'Quinzenal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'BIMONTHLY', label: 'Bimestral' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUAL', label: 'Semestral' },
  { value: 'YEARLY', label: 'Anual' }
];

const FREQUENCY_LABELS = {
  DAILY: 'diários',
  WEEKLY: 'semanais',
  BIWEEKLY: 'quinzenais',
  MONTHLY: 'mensais',
  BIMONTHLY: 'bimestrais',
  QUARTERLY: 'trimestrais',
  SEMIANNUAL: 'semestrais',
  YEARLY: 'anuais'
};

const FREQUENCY_PREVIEW_LABELS = {
  DAILY: 'todo dia',
  WEEKLY: 'toda semana',
  BIWEEKLY: 'a cada 15 dias',
  MONTHLY: 'todo mês',
  BIMONTHLY: 'a cada 2 meses',
  QUARTERLY: 'a cada 3 meses',
  SEMIANNUAL: 'a cada 6 meses',
  YEARLY: 'todo ano'
};

function getDayOfMonth(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDate();
}

function getMonthName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { month: 'long' });
}

function getFullMonthName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

const initialFormValues = {
  description: '',
  amount: '',
  type: 'EXPENSE',
  frequency: 'MONTHLY',
  startDate: new Date().toISOString().slice(0, 10),
  endDateEnabled: false,
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
    endDateEnabled: !!recurrence.endDate,
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

function buildPreviewText(formValues) {
  if (!formValues.startDate || !formValues.amount) return null;

  const amount = Number(formValues.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const freqLabel = FREQUENCY_PREVIEW_LABELS[formValues.frequency] || formValues.frequency;
  const day = getDayOfMonth(formValues.startDate);
  const startMonth = getFullMonthName(formValues.startDate);

  let mainText = `Serão criados lançamentos ${FREQUENCY_LABELS[formValues.frequency] || 'recorrentes'} de ${formatCurrencyBRL(amount)} ${freqLabel}`;

  if (day && formValues.frequency === 'MONTHLY') {
    const dayLabel = day === 1 ? 'todo dia 1º' : `todo dia ${day}`;
    mainText = `Serão criados lançamentos mensais de ${formatCurrencyBRL(amount)} ${dayLabel}, começando em ${startMonth}.`;
  } else {
    mainText += `, começando em ${startMonth}.`;
  }

  let endText = null;
  if (formValues.endDateEnabled && formValues.endDate) {
    endText = `Último lançamento previsto: ${formatDateBR(formValues.endDate)}.`;
  } else {
    endText = 'Esta recorrência continuará ativa até ser pausada ou encerrada.';
  }

  return { mainText, endText };
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

  const preview = useMemo(() => buildPreviewText(formValues), [formValues]);

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

      if (name === 'endDateEnabled' && !nextValue) {
        nextValues.endDate = '';
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
      setError('Informe um valor positivo válido.');
      return;
    }

    if (!formValues.startDate) {
      setError('Informe a data do primeiro lançamento.');
      return;
    }

    if (formValues.endDateEnabled && formValues.endDate && formValues.endDate < formValues.startDate) {
      setError('A data final deve ser maior ou igual à data do primeiro lançamento.');
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
      endDate: formValues.endDateEnabled && formValues.endDate ? formValues.endDate : null,
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

      <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Esta recorrência criará automaticamente lançamentos futuros conforme a frequência escolhida.
            Você também pode gerar cada lançamento manualmente quando desejar.
          </p>
        </div>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Descrição"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              placeholder="Ex: Aluguel, Salário, Internet..."
            />
          </div>

          <Input
            label="Valor"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formValues.amount}
            onChange={handleChange}
          />

          <Select label="Frequência" name="frequency" value={formValues.frequency} onChange={handleChange}>
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Tipo" name="type" value={formValues.type} onChange={handleChange}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Input
            label="Data do primeiro lançamento"
            name="startDate"
            type="date"
            value={formValues.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
          <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Repetir até</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="radio"
                name="endDateEnabled"
                checked={!formValues.endDateEnabled}
                onChange={() => setFormValues((v) => ({ ...v, endDateEnabled: false, endDate: '' }))}
                className="h-4 w-4 text-emerald-600"
              />
              Sem data final
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="radio"
                name="endDateEnabled"
                checked={formValues.endDateEnabled}
                onChange={() => setFormValues((v) => ({ ...v, endDateEnabled: true }))}
                className="h-4 w-4 text-emerald-600"
              />
              Até uma data específica
            </label>
          </div>
          {formValues.endDateEnabled && (
            <div className="mt-3">
              <Input
                label="Data de término"
                name="endDate"
                type="date"
                value={formValues.endDate}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Select label="Categoria" name="categoryId" value={formValues.categoryId} onChange={handleChange}>
            <option value="">Selecione uma categoria</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>

          <Select label="Forma de pagamento" name="paymentMethod" value={formValues.paymentMethod} onChange={handleChange}>
            <option value="">Não informado</option>
            <option value="PIX">Pix</option>
            <option value="DEBIT_CARD">Cartão de débito</option>
            <option value="CREDIT_CARD">Cartão de crédito</option>
            <option value="CASH">Dinheiro</option>
            <option value="BANK_SLIP">Boleto</option>
            <option value="TRANSFER">Transferência</option>
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
            <Select label="Cartão de crédito" name="creditCardId" value={formValues.creditCardId} onChange={handleChange} disabled={isIncome || !creditCards.length}>
              <option value="">{creditCards.length ? 'Selecione um cartão' : (isIncome ? 'Não disponível para receitas' : 'Nenhum cartão disponível')}</option>
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
            Geração automática
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
            <input name="generateAsPaid" type="checkbox" checked={formValues.generateAsPaid} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
            Gerar como pago
          </label>
        </div>

        {preview && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Prévia</p>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{preview.mainText}</p>
            {preview.endText && (
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{preview.endText}</p>
            )}
          </div>
        )}

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
