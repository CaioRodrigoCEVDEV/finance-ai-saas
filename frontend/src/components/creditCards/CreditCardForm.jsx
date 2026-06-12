import { useEffect, useState } from 'react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { cn } from '../../utils/cn';

const BRAND_OPTIONS = [
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'ELO', label: 'Elo' },
  { value: 'AMEX', label: 'Amex' },
  { value: 'HIPERCARD', label: 'Hipercard' },
  { value: 'OTHER', label: 'Outra' }
];

const COLORS = [
  { hex: '#7c3aed', label: 'Roxo' },
  { hex: '#10b981', label: 'Verde' },
  { hex: '#2563eb', label: 'Azul' },
  { hex: '#06b6d4', label: 'Ciano' },
  { hex: '#f97316', label: 'Laranja' },
  { hex: '#ef4444', label: 'Vermelho' },
  { hex: '#ec4899', label: 'Rosa' },
  { hex: '#eab308', label: 'Amarelo' },
  { hex: '#64748b', label: 'Cinza' },
  { hex: '#111827', label: 'Preto' }
];

const initialFormValues = {
  name: '',
  brand: 'MASTERCARD',
  limitAmount: '0',
  closingDay: '10',
  dueDay: '17',
  accountId: '',
  color: '#7c3aed',
  isActive: true
};

function buildFormValues(creditCard) {
  if (!creditCard) {
    return initialFormValues;
  }

  return {
    name: creditCard.name || '',
    brand: creditCard.brand || 'MASTERCARD',
    limitAmount: String(creditCard.limitAmount ?? 0),
    closingDay: String(creditCard.closingDay ?? 10),
    dueDay: String(creditCard.dueDay ?? 17),
    accountId: creditCard.account?.id || '',
    color: creditCard.color || '#7c3aed',
    isActive: creditCard.isActive ?? true
  };
}

function CreditCardForm({ creditCard, accounts, loadingAccounts, loading, serverError, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormValues(buildFormValues(creditCard));
    setError('');
  }, [creditCard]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formValues.name.trim().length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }

    const limitAmount = Number(formValues.limitAmount);
    const closingDay = Number(formValues.closingDay);
    const dueDay = Number(formValues.dueDay);

    if (!Number.isFinite(limitAmount) || limitAmount < 0) {
      setError('Informe um limite maior ou igual a zero.');
      return;
    }

    if (!Number.isInteger(closingDay) || closingDay < 1 || closingDay > 31) {
      setError('Informe um dia de fechamento entre 1 e 31.');
      return;
    }

    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      setError('Informe um dia de vencimento entre 1 e 31.');
      return;
    }

    setError('');
    await onSubmit({
      name: formValues.name.trim(),
      brand: formValues.brand || null,
      limitAmount,
      closingDay,
      dueDay,
      accountId: formValues.accountId || null,
      color: formValues.color.trim() || null,
      isActive: formValues.isActive
    });
  }

  return (
    <section>
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">{creditCard ? 'Editar cartão' : 'Novo cartão'}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {creditCard ? 'Atualize os dados do cartão' : 'Cadastre um novo cartão de crédito'}
        </h2>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Nome" name="name" value={formValues.name} onChange={handleChange} />

          <Select label="Bandeira" name="brand" value={formValues.brand} onChange={handleChange}>
            {BRAND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Input label="Limite" name="limitAmount" type="number" step="0.01" min="0" value={formValues.limitAmount} onChange={handleChange} />
          <Input label="Dia de fechamento" name="closingDay" type="number" min="1" max="31" value={formValues.closingDay} onChange={handleChange} />
          <Input label="Dia de vencimento" name="dueDay" type="number" min="1" max="31" value={formValues.dueDay} onChange={handleChange} />

          <Select label="Conta vinculada" name="accountId" value={formValues.accountId} onChange={handleChange} disabled={loadingAccounts}>
            <option value="">Nenhuma conta vinculada</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Cor do cartão</span>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const currentColorInList = COLORS.some(
                  (c) => c.hex.toLowerCase() === formValues.color.toLowerCase()
                );
                const swatches = currentColorInList
                  ? COLORS
                  : [
                      ...(formValues.color && formValues.color.trim()
                        ? [{ hex: formValues.color.trim(), label: 'Atual' }]
                        : []),
                      ...COLORS
                    ];

                return swatches.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setFormValues((prev) => ({ ...prev, color: color.hex }))}
                    className={cn(
                      'relative h-9 w-9 rounded-xl border-2 transition',
                      formValues.color.toLowerCase() === color.hex.toLowerCase()
                        ? 'border-slate-900 shadow-md dark:border-white scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                    aria-label={color.label}
                  >
                    {color.label === 'Atual' ? (
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        Atual
                      </span>
                    ) : null}
                  </button>
                ));
              })()}
            </div>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
              {COLORS.find((c) => c.hex.toLowerCase() === formValues.color.toLowerCase())?.label || 'Cor personalizada'}
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          <input name="isActive" type="checkbox" checked={formValues.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
          Cartao ativo
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!error && serverError ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            {serverError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : creditCard ? 'Salvar alterações' : 'Criar cartão'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </section>
  );
}

export default CreditCardForm;
