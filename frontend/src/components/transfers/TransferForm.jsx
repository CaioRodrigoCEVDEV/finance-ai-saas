import { useEffect, useRef, useState } from 'react';

import Input from '../ui/Input';
import Select from '../ui/Select';
import { formatCurrencyBRL } from '../../utils/formatters';

const initialFormValues = {
  description: '',
  amount: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  fromAccountId: '',
  toAccountId: '',
  notes: ''
};

function buildFormValues(transfer) {
  if (!transfer) {
    return initialFormValues;
  }

  return {
    description: transfer.description || '',
    amount: String(transfer.amount ?? ''),
    transactionDate: transfer.transactionDate ? transfer.transactionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    fromAccountId: transfer.fromAccount?.id || '',
    toAccountId: transfer.toAccount?.id || '',
    notes: transfer.notes || ''
  };
}

function TransferForm({ transfer, accounts, onSubmit, serverError, formId = 'transfer-form' }) {
  const formRef = useRef(null);
  const amountRef = useRef(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [displayAmount, setDisplayAmount] = useState('');
  const [errors, setErrors] = useState({});
  const fieldClassName = 'h-11 py-0 text-sm';

  const activeAccounts = accounts.filter((a) => a.isActive !== false);
  const destinationAccounts = activeAccounts.filter((a) => a.id !== formValues.fromAccountId);
  const sourceAccounts = activeAccounts.filter((a) => a.id !== formValues.toAccountId);

  useEffect(() => {
    const values = buildFormValues(transfer);
    setFormValues(values);
    setErrors({});
    if (values.amount) {
      setDisplayAmount(formatCurrencyBRL(Number(values.amount)));
    } else {
      setDisplayAmount('');
    }
  }, [transfer]);

  useEffect(() => {
    if (amountRef.current && !transfer) {
      amountRef.current.focus();
    }
  }, [transfer]);

  function handleChange(event) {
    const { name, value } = event.target;

    setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'amount') {
      const digits = value.replace(/\D/g, '');
      const cents = parseInt(digits || '0', 10);
      const numericValue = cents / 100;
      setFormValues((prev) => ({ ...prev, amount: String(numericValue) }));
      setDisplayAmount(formatCurrencyBRL(numericValue));
      return;
    }

    setFormValues((currentValues) => {
      const nextValues = { ...currentValues, [name]: value };

      if (name === 'fromAccountId' && value === currentValues.toAccountId) {
        nextValues.toAccountId = '';
      }

      if (name === 'toAccountId' && value === currentValues.fromAccountId) {
        nextValues.fromAccountId = '';
      }

      return nextValues;
    });
  }

  function scrollToFirstError() {
    if (!formRef.current) {
      return;
    }

    const firstError = formRef.current.querySelector('[data-error="true"]');

    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    const amount = Number(formValues.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = 'Informe um valor positivo valido.';
    }

    if (!formValues.transactionDate) {
      nextErrors.transactionDate = 'Informe a data da transferencia.';
    }

    if (!formValues.fromAccountId) {
      nextErrors.fromAccountId = 'Selecione a conta de origem.';
    }

    if (!formValues.toAccountId) {
      nextErrors.toAccountId = 'Selecione a conta de destino.';
    }

    if (formValues.fromAccountId && formValues.toAccountId && formValues.fromAccountId === formValues.toAccountId) {
      nextErrors.toAccountId = 'Conta de destino deve ser diferente da origem.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError();
      return;
    }

    const fromAccount = activeAccounts.find((a) => a.id === formValues.fromAccountId);
    const toAccount = activeAccounts.find((a) => a.id === formValues.toAccountId);

    const payload = {
      description: `${fromAccount?.name || 'Conta'} → ${toAccount?.name || 'Conta'}`,
      amount,
      transactionDate: formValues.transactionDate,
      fromAccountId: formValues.fromAccountId,
      toAccountId: formValues.toAccountId,
      notes: formValues.notes.trim() || null
    };

    await onSubmit(payload);
  }

  return (
    <section>
      <form ref={formRef} id={formId} className="space-y-6" onSubmit={handleSubmit}>
        {serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-400">
            {serverError}
          </div>
        ) : null}

        {/* Valor */}
        <div>
          <label className="block">
            <span className="mb-2 block text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              Valor
            </span>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700/40 dark:focus-within:border-emerald-500 dark:focus-within:ring-emerald-900/30">
              <input
                ref={amountRef}
                name="amount"
                type="text"
                autoFocus={!transfer}
                value={displayAmount}
                onChange={handleChange}
                placeholder="R$ 0,00"
                inputMode="numeric"
                className="w-full bg-transparent text-center text-4xl font-bold text-slate-900 outline-none placeholder:text-slate-300 dark:text-slate-100 dark:placeholder:text-slate-600"
              />
            </div>
            {errors.amount ? (
              <span className="mt-2 block text-center text-sm text-rose-600">{errors.amount}</span>
            ) : null}
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {/* Data */}
          <Input
            label="Data"
            name="transactionDate"
            type="date"
            error={errors.transactionDate}
            value={formValues.transactionDate}
            onChange={handleChange}
            className={fieldClassName}
          />

          {/* Espaçador no grid */}
          <div className="hidden md:block" />

          {/* Conta de Origem */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3 transition dark:border-rose-800/30 dark:bg-rose-950/20">
            <Select
              label="Conta de Origem"
              name="fromAccountId"
              error={errors.fromAccountId}
              value={formValues.fromAccountId}
              onChange={handleChange}
              className={fieldClassName}
            >
              <option value="">Selecione a conta de origem</option>
              {sourceAccounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">De onde saiu o dinheiro.</p>
          </div>

          {/* Conta de Destino */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 transition dark:border-emerald-800/30 dark:bg-emerald-950/20">
            <Select
              label="Conta de Destino"
              name="toAccountId"
              error={errors.toAccountId}
              value={formValues.toAccountId}
              onChange={handleChange}
              className={fieldClassName}
            >
              <option value="">Selecione a conta de destino</option>
              {destinationAccounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Para onde o dinheiro vai.</p>
          </div>

          {/* Descrição */}
          <div className="md:col-span-2">
            <Input
              label="Descricao (opcional)"
              name="description"
              error={errors.description}
              value={formValues.description}
              onChange={handleChange}
              placeholder="Ex.: Poupanca, Investimento, Reserva"
              className={fieldClassName}
            />
          </div>

          {/* Observações */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Observacoes</span>
              <textarea
                name="notes"
                value={formValues.notes}
                onChange={handleChange}
                className="h-20 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                placeholder="Adicionar observacao"
              />
            </label>
          </div>
        </div>
      </form>
    </section>
  );
}

export default TransferForm;
