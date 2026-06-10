import { useEffect, useState } from 'react';

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
  color: '#38bdf8',
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
    color: account.color || '#38bdf8',
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
    <section className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-sky-300/80">{account ? 'Editar conta' : 'Nova conta'}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {account ? 'Atualize os dados da conta' : 'Cadastre uma nova conta financeira'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          Fechar
        </button>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Nome</span>
            <input name="name" value={formValues.name} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Tipo</span>
            <select name="type" value={formValues.type} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-sky-400">
              {ACCOUNT_TYPES.map((typeOption) => (
                <option key={typeOption.value} value={typeOption.value}>{typeOption.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Banco</span>
            <input name="bankName" value={formValues.bankName} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Moeda</span>
            <input name="currency" maxLength="3" value={formValues.currency} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 uppercase text-white outline-none transition focus:border-sky-400" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Saldo inicial</span>
            <input name="initialBalance" type="number" step="0.01" value={formValues.initialBalance} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Saldo atual</span>
            <input name="currentBalance" type="number" step="0.01" value={formValues.currentBalance} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Cor</span>
            <input name="color" value={formValues.color} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Icone</span>
            <input name="icon" value={formValues.icon} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-sky-400" />
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
          <input name="isActive" type="checkbox" checked={formValues.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 bg-slate-900" />
          Conta ativa
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading} className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Salvando...' : account ? 'Salvar alteracoes' : 'Criar conta'}
          </button>
          <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-700 px-5 py-3 font-medium text-white transition hover:border-slate-500">
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default AccountForm;
