import { useEffect, useState } from 'react';

import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const TYPE_OPTIONS = [
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'INVESTMENT', label: 'Investimento' }
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'CANCELED', label: 'Cancelada' }
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'PIX', label: 'Pix' },
  { value: 'DEBIT_CARD', label: 'Cartao de debito' },
  { value: 'CREDIT_CARD', label: 'Cartao de credito' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'BANK_SLIP', label: 'Boleto' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'OTHER', label: 'Outro' }
];

const initialFormValues = {
  description: '',
  amount: '',
  type: 'EXPENSE',
  status: 'CONFIRMED',
  transactionDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'PIX',
  accountId: '',
  creditCardId: '',
  categoryId: '',
  notes: '',
  isRecurring: false,
  isInstallment: false,
  installmentNumber: '',
  installmentTotal: ''
};

function buildFormValues(transaction) {
  if (!transaction) {
    return initialFormValues;
  }

  return {
    description: transaction.description || '',
    amount: String(transaction.amount ?? ''),
    type: transaction.type || 'EXPENSE',
    status: transaction.status || 'CONFIRMED',
    transactionDate: transaction.transactionDate ? transaction.transactionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    paymentMethod: transaction.paymentMethod || 'PIX',
    accountId: transaction.account?.id || '',
    creditCardId: transaction.creditCard?.id || '',
    categoryId: transaction.category?.id || '',
    notes: transaction.notes || '',
    isRecurring: transaction.isRecurring ?? false,
    isInstallment: transaction.isInstallment ?? false,
    installmentNumber: transaction.installmentNumber ? String(transaction.installmentNumber) : '',
    installmentTotal: transaction.installmentTotal ? String(transaction.installmentTotal) : ''
  };
}

function TransactionForm({ transaction, accounts, categories, creditCards, loading, serverError, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormValues(buildFormValues(transaction));
    setError('');
  }, [transaction]);

  const filteredCategories = categories.filter((category) => category.type === formValues.type);
  const isCreditCardPayment = formValues.paymentMethod === 'CREDIT_CARD';

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormValues((currentValues) => {
      const nextValues = {
        ...currentValues,
        [name]: nextValue
      };

      if (name === 'type' && nextValue === 'TRANSFER') {
        nextValues.categoryId = '';
      }

      if (name === 'paymentMethod' && nextValue !== 'CREDIT_CARD') {
        nextValues.creditCardId = '';
      }

      if (name === 'isInstallment' && !checked) {
        nextValues.installmentNumber = '';
        nextValues.installmentTotal = '';
      }

      return nextValues;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formValues.description.trim().length < 2) {
      setError('Informe uma descricao com pelo menos 2 caracteres.');
      return;
    }

    const amount = Number(formValues.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Informe um valor positivo valido.');
      return;
    }

    if (!formValues.transactionDate) {
      setError('Informe a data da transacao.');
      return;
    }

    if (isCreditCardPayment && !formValues.creditCardId && !formValues.accountId) {
      setError('Informe um cartao de credito ou uma conta para pagamentos no credito.');
      return;
    }

    if (!isCreditCardPayment && !formValues.accountId) {
      setError('Informe a conta da transacao.');
      return;
    }

    if (formValues.isInstallment) {
      const installmentNumber = Number(formValues.installmentNumber);
      const installmentTotal = Number(formValues.installmentTotal);

      if (!Number.isInteger(installmentTotal) || installmentTotal <= 1) {
        setError('Informe um total de parcelas maior que 1.');
        return;
      }

      if (!Number.isInteger(installmentNumber) || installmentNumber < 1 || installmentNumber > installmentTotal) {
        setError('Numero da parcela deve estar entre 1 e o total de parcelas.');
        return;
      }
    }

    const payload = {
      description: formValues.description.trim(),
      amount,
      type: formValues.type,
      status: formValues.status,
      transactionDate: formValues.transactionDate,
      paymentMethod: formValues.paymentMethod,
      accountId: formValues.accountId || null,
      creditCardId: formValues.creditCardId || null,
      categoryId: formValues.type === 'TRANSFER' ? (formValues.categoryId || null) : (formValues.categoryId || null),
      notes: formValues.notes.trim() || null,
      isRecurring: formValues.isRecurring,
      isInstallment: formValues.isInstallment,
      installmentNumber: formValues.isInstallment ? Number(formValues.installmentNumber) : null,
      installmentTotal: formValues.isInstallment ? Number(formValues.installmentTotal) : null
    };

    setError('');
    await onSubmit(payload);
  }

  return (
    <section>
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">{transaction ? 'Editar transacao' : 'Nova transacao'}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          {transaction ? 'Atualize os dados da transacao' : 'Cadastre uma nova movimentacao financeira'}
        </h2>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Descricao" name="description" value={formValues.description} onChange={handleChange} />
          </div>

          <Input label="Valor" name="amount" type="number" step="0.01" min="0" value={formValues.amount} onChange={handleChange} />

          <Input label="Data" name="transactionDate" type="date" value={formValues.transactionDate} onChange={handleChange} />

          <Select label="Tipo" name="type" value={formValues.type} onChange={handleChange}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Status" name="status" value={formValues.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Metodo de pagamento" name="paymentMethod" value={formValues.paymentMethod} onChange={handleChange}>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Categoria" name="categoryId" value={formValues.categoryId} onChange={handleChange} disabled={formValues.type === 'TRANSFER'}>
            <option value="">{formValues.type === 'TRANSFER' ? 'Opcional para transferencia' : 'Selecione uma categoria'}</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className={cn('rounded-[24px] border p-4 transition', !isCreditCardPayment ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50')}>
            <Select label="Conta" name="accountId" value={formValues.accountId} onChange={handleChange}>
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </Select>
            <p className="mt-2 text-xs text-slate-500">Obrigatoria para pagamentos fora do credito.</p>
          </div>

          <div className={cn('rounded-[24px] border p-4 transition', isCreditCardPayment ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50')}>
            <Select label="Cartao de credito" name="creditCardId" value={formValues.creditCardId} onChange={handleChange} disabled={!creditCards.length}>
              <option value="">{creditCards.length ? 'Selecione um cartao' : 'Nenhum cartao disponivel'}</option>
              {creditCards.map((creditCard) => (
                <option key={creditCard.id} value={creditCard.id}>{creditCard.name}</option>
              ))}
            </Select>
            <p className="mt-2 text-xs text-slate-500">Destacado quando o metodo for cartao de credito.</p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Observacoes</span>
          <textarea
            name="notes"
            rows="4"
            value={formValues.notes}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            placeholder="Detalhes adicionais da transacao"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input name="isRecurring" type="checkbox" checked={formValues.isRecurring} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
            Transacao recorrente
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input name="isInstallment" type="checkbox" checked={formValues.isInstallment} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
            Transacao parcelada
          </label>
        </div>

        {formValues.isInstallment ? (
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Numero da parcela" name="installmentNumber" type="number" min="1" value={formValues.installmentNumber} onChange={handleChange} />
            <Input label="Total de parcelas" name="installmentTotal" type="number" min="2" value={formValues.installmentTotal} onChange={handleChange} />
          </div>
        ) : null}

        {error || serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error || serverError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : transaction ? 'Salvar alteracoes' : 'Criar transacao'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </section>
  );
}

export default TransactionForm;
