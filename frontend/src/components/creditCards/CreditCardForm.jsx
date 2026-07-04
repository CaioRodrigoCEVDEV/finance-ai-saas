import { useEffect, useRef, useState } from 'react';

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

function CreditCardForm({ creditCard, accounts, loadingAccounts, onSubmit, formId = 'credit-card-form' }) {
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const fieldClassName = 'h-11 py-0 text-sm';

  useEffect(() => {
    setFormValues(buildFormValues(creditCard));
    setErrors({});
  }, [creditCard]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setErrors((prev) => ({ ...prev, [name]: '' }));

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value
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

    const limitAmount = Number(formValues.limitAmount);
    const closingDay = Number(formValues.closingDay);
    const dueDay = Number(formValues.dueDay);

    if (!Number.isFinite(limitAmount) || limitAmount < 0) {
      nextErrors.limitAmount = 'Informe um limite maior ou igual a zero.';
    }

    if (!Number.isInteger(closingDay) || closingDay < 1 || closingDay > 31) {
      nextErrors.closingDay = 'Informe um dia de fechamento entre 1 e 31.';
    }

    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      nextErrors.dueDay = 'Informe um dia de vencimento entre 1 e 31.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError();
      return;
    }

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
      <form ref={formRef} id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <Input label="Nome" name="name" error={errors.name} value={formValues.name} onChange={handleChange} className={fieldClassName} />

          <Select label="Bandeira" name="brand" value={formValues.brand} onChange={handleChange} className={fieldClassName}>
            {BRAND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Input label="Limite" name="limitAmount" type="number" step="0.01" min="0" error={errors.limitAmount} value={formValues.limitAmount} onChange={handleChange} className={fieldClassName} />
          <Input label="Dia de fechamento" name="closingDay" type="number" min="1" max="31" error={errors.closingDay} value={formValues.closingDay} onChange={handleChange} className={fieldClassName} />
          <Input label="Dia de vencimento" name="dueDay" type="number" min="1" max="31" error={errors.dueDay} value={formValues.dueDay} onChange={handleChange} className={fieldClassName} />

          <Select label="Conta vinculada" name="accountId" value={formValues.accountId} onChange={handleChange} disabled={loadingAccounts} className={fieldClassName}>
            <option value="">Nenhuma conta vinculada</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Cor do cartao</span>
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

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:border-slate-600/70 dark:bg-slate-700/30 dark:text-slate-300">
          <input name="isActive" type="checkbox" checked={formValues.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
          Cartao ativo
        </label>
      </form>
    </section>
  );
}

export default CreditCardForm;
