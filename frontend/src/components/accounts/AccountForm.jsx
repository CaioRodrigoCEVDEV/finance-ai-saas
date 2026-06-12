import { useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  Coins,
  CreditCard,
  Landmark,
  PiggyBank,
  Shield,
  Smartphone,
  TrendingUp,
  Wallet
} from 'lucide-react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { cn } from '../../utils/cn';

const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Conta corrente' },
  { value: 'SAVINGS', label: 'Poupanca' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'INVESTMENT', label: 'Investimento' },
  { value: 'WALLET', label: 'Carteira' },
  { value: 'OTHER', label: 'Outra' }
];

const BANKS = [
  'Nubank',
  'Itau',
  'Bradesco',
  'Banco do Brasil',
  'Caixa',
  'Santander',
  'Inter',
  'C6 Bank',
  'Mercado Pago',
  'PicPay',
  'Neon',
  'BTG Pactual',
  'Sofisa Direto',
  'Sicredi',
  'Sicoob',
  'Outro'
];

const CURRENCIES = [
  { value: 'BRL', label: 'BRL - Real brasileiro' },
  { value: 'USD', label: 'USD - Dolar americano' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - Libra esterlina' },
  { value: 'ARS', label: 'ARS - Peso argentino' },
  { value: 'BTC', label: 'BTC - Bitcoin' }
];

const COLORS = [
  { hex: '#10b981', label: 'Verde' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#8b5cf6', label: 'Roxo' },
  { hex: '#ec4899', label: 'Rosa' },
  { hex: '#f59e0b', label: 'Amarelo' },
  { hex: '#ef4444', label: 'Vermelho' },
  { hex: '#06b6d4', label: 'Ciano' },
  { hex: '#64748b', label: 'Cinza' }
];

const ICONS = [
  { value: 'bank', label: 'Banco', Icon: Building2 },
  { value: 'wallet', label: 'Carteira', Icon: Wallet },
  { value: 'piggy-bank', label: 'Cofrinho', Icon: PiggyBank },
  { value: 'credit-card', label: 'Cartao', Icon: CreditCard },
  { value: 'landmark', label: 'Inst. financeira', Icon: Landmark },
  { value: 'coins', label: 'Dinheiro', Icon: Coins },
  { value: 'chart-line', label: 'Investimentos', Icon: TrendingUp },
  { value: 'safe', label: 'Reserva', Icon: Shield },
  { value: 'smartphone', label: 'Conta digital', Icon: Smartphone },
  { value: 'briefcase', label: 'Empresarial', Icon: Briefcase }
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

function resolveBank(account) {
  if (!account || !account.bankName) {
    return { selectedBank: '', customBankName: '' };
  }

  const bankName = account.bankName;
  const predefined = BANKS.slice(0, -1);
  const match = predefined.find((b) => b.toLowerCase() === bankName.toLowerCase());

  if (match) {
    return { selectedBank: match, customBankName: '' };
  }

  return { selectedBank: 'Outro', customBankName: bankName };
}

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

function AccountForm({ account, loading, onCancel, onSubmit, serverError }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [selectedBank, setSelectedBank] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setFormValues(buildFormValues(account));
    const bank = resolveBank(account);
    setSelectedBank(bank.selectedBank);
    setCustomBankName(bank.customBankName);
    setError('');
  }, [account]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleBankChange(event) {
    setSelectedBank(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formValues.name.trim().length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }

    const finalBankName =
      selectedBank === 'Outro' ? customBankName.trim() : selectedBank;

    const payload = {
      name: formValues.name.trim(),
      type: formValues.type,
      bankName: finalBankName || null,
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

          <div>
            <Select label="Banco" value={selectedBank} onChange={handleBankChange}>
              <option value="">Selecionar banco (opcional)</option>
              {BANKS.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </Select>
            {selectedBank === 'Outro' ? (
              <div className="mt-2">
                <Input
                  label="Nome do banco"
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                  placeholder="Digite o nome do banco"
                />
              </div>
            ) : null}
          </div>

          <Select label="Moeda" name="currency" value={formValues.currency} onChange={handleChange}>
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>

          <Input label="Saldo inicial" name="initialBalance" type="number" step="0.01" value={formValues.initialBalance} onChange={handleChange} />
          <Input label="Saldo atual" name="currentBalance" type="number" step="0.01" value={formValues.currentBalance} onChange={handleChange} />

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Cor</span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setFormValues((prev) => ({ ...prev, color: color.hex }))}
                  className={cn(
                    'h-9 w-9 rounded-xl border-2 transition',
                    formValues.color === color.hex
                      ? 'border-slate-900 shadow-md dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Icone</span>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormValues((prev) => ({ ...prev, icon: value }))}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition',
                    formValues.icon === value
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/30'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500'
                  )}
                  title={label}
                  aria-label={label}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      formValues.icon === value
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  />
                  <span className="text-[10px] leading-tight text-slate-500 dark:text-slate-400 truncate max-w-full">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          <input name="isActive" type="checkbox" checked={formValues.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
          Conta ativa
        </label>

        {error || serverError ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            {error || serverError}
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
