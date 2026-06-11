import { useEffect, useState } from 'react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Conta corrente' },
  { value: 'SAVINGS', label: 'Poupanca' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'INVESTMENT', label: 'Investimento' },
  { value: 'WALLET', label: 'Carteira' },
  { value: 'OTHER', label: 'Outra' }
];

const initialFormValues = {
  name: '',
  type: 'CHECKING',
  bankName: '',
  initialBalance: '0',
  currentBalance: '',
  currency: 'BRL',
  color: '#10b981',
  icon: 'bank',
  isActive: true
};

function buildFormValues(account) {
  if (!account) {
    return initialFormValues;
  }

  return {
    name: account.name || '',
    type: account.type || 'CHECKING',
    bankName: account.bankName || '',
    initialBalance: String(account.initialBalance ?? 0),
    currentBalance: String(account.currentBalance ?? ''),
    currency: account.currency || 'BRL',
    color: account.color || '#10b981',
    icon: account.icon || 'bank',
    isActive: account.isActive ?? true
  };
}

function AccountForm({ account, loading, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormValues(buildFormValues(account));
    setError('');
  }, [account]);

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

    const payload = {
      name: formValues.name.trim(),
      type: formValues.type,
      bankName: formValues.bankName.trim() || null,
      initialBalance: formValues.initialBalance === '' ? undefined : Number(formValues.initialBalance),
      currentBalance: formValues.currentBalance === '' ? undefined : Number(formValues.currentBalance),
      currency: formValues.currency.trim().toUpperCase() || 'BRL',
      color: formValues.color.trim() || null,
      icon: formValues.icon.trim() || null,
      isActive: formValues.isActive
    };

    if (
      (payload.initialBalance !== undefined && Number.isNaN(payload.initialBalance))
      || (payload.currentBalance !== undefined && Number.isNaN(payload.currentBalance))
    ) {
      setError('Informe valores numericos validos para os saldos.');
      return;
    }

    setError('');
    await onSubmit(payload);
  }

  return (
    <section>
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">{account ? 'Editar conta' : 'Nova conta'}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {account ? 'Atualize os dados da conta' : 'Cadastre uma nova conta financeira'}
        </h2>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Nome" name="name" value={formValues.name} onChange={handleChange} />

          <Select label="Tipo" name="type" value={formValues.type} onChange={handleChange}>
              {ACCOUNT_TYPES.map((typeOption) => (
                <option key={typeOption.value} value={typeOption.value}>{typeOption.label}</option>
              ))}
          </Select>

          <Input label="Banco" name="bankName" value={formValues.bankName} onChange={handleChange} />
          <Input label="Moeda" name="currency" maxLength="3" value={formValues.currency} onChange={handleChange} className="uppercase" />
          <Input label="Saldo inicial" name="initialBalance" type="number" step="0.01" value={formValues.initialBalance} onChange={handleChange} />
          <Input label="Saldo atual" name="currentBalance" type="number" step="0.01" value={formValues.currentBalance} onChange={handleChange} />
          <Input label="Cor" name="color" value={formValues.color} onChange={handleChange} />
          <Input label="Icone" name="icon" value={formValues.icon} onChange={handleChange} />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          <input name="isActive" type="checkbox" checked={formValues.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
          Conta ativa
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : account ? 'Salvar alteracoes' : 'Criar conta'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </section>
  );
}

export default AccountForm;
