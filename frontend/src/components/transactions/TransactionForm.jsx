import { useEffect, useRef, useState } from 'react';

import Input from '../ui/Input';
import Select from '../ui/Select';

const TYPE_OPTIONS = [
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'TRANSFER', label: 'Transferência' },
  { value: 'INVESTMENT', label: 'Investimento' }
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'CANCELED', label: 'Cancelada' }
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'PIX', label: 'Pix' },
  { value: 'DEBIT_CARD', label: 'Cartão de débito' },
  { value: 'CREDIT_CARD', label: 'Cartão de crédito' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'BANK_SLIP', label: 'Boleto' },
  { value: 'TRANSFER', label: 'Transferência' },
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
    isInstallment: transaction.isInstallment ?? false,
    installmentNumber: transaction.installmentNumber ? String(transaction.installmentNumber) : '',
    installmentTotal: transaction.installmentTotal ? String(transaction.installmentTotal) : ''
  };
}

function TransactionForm({ transaction, accounts, categories, creditCards, onSubmit, formId = 'transaction-form' }) {
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const fieldClassName = 'h-11 py-0 text-sm';

  useEffect(() => {
    setFormValues(buildFormValues(transaction));
    setErrors({});
  }, [transaction]);

  const filteredCategories = categories.filter((category) => category.type === formValues.type);
  const isCreditCardPayment = formValues.paymentMethod === 'CREDIT_CARD';

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setErrors((prev) => ({ ...prev, [name]: '' }));

    setFormValues((currentValues) => {
      const nextValues = {
        ...currentValues,
        [name]: nextValue
      };

      if (name === 'type' && nextValue === 'TRANSFER') {
        nextValues.categoryId = '';
      }

      if (name === 'paymentMethod') {
        if (nextValue === 'CREDIT_CARD') {
          nextValues.accountId = '';
        } else {
          nextValues.creditCardId = '';
        }
      }

      if (name === 'isInstallment' && !checked) {
        nextValues.installmentNumber = '';
        nextValues.installmentTotal = '';
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

    if (formValues.description.trim().length < 2) {
      nextErrors.description = 'Informe uma descrição com pelo menos 2 caracteres.';
    }

    const amount = Number(formValues.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = 'Informe um valor positivo válido.';
    }

    if (!formValues.transactionDate) {
      nextErrors.transactionDate = 'Informe a data da transação.';
    }

    if (isCreditCardPayment && !formValues.creditCardId) {
      nextErrors.creditCardId = 'Informe o cartão de crédito da transação.';
    }

    if (!isCreditCardPayment && !formValues.accountId) {
      nextErrors.accountId = 'Informe a conta da transação.';
    }

    if (formValues.isInstallment) {
      const installmentNumber = Number(formValues.installmentNumber);
      const installmentTotal = Number(formValues.installmentTotal);

      if (!Number.isInteger(installmentTotal) || installmentTotal <= 1) {
        nextErrors.installmentTotal = 'Informe um total de parcelas maior que 1.';
      }

      if (!Number.isInteger(installmentNumber) || installmentNumber < 1 || installmentNumber > installmentTotal) {
        nextErrors.installmentNumber = 'Número da parcela deve estar entre 1 e o total de parcelas.';
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError();
      return;
    }

    const payload = {
      description: formValues.description.trim(),
      amount,
      type: formValues.type,
      status: formValues.status,
      transactionDate: formValues.transactionDate,
      paymentMethod: formValues.paymentMethod,
      accountId: isCreditCardPayment ? null : (formValues.accountId || null),
      creditCardId: isCreditCardPayment ? (formValues.creditCardId || null) : null,
      categoryId: formValues.type === 'TRANSFER' ? (formValues.categoryId || null) : (formValues.categoryId || null),
      notes: formValues.notes.trim() || null,
      isInstallment: formValues.isInstallment,
      installmentNumber: formValues.isInstallment ? Number(formValues.installmentNumber) : null,
      installmentTotal: formValues.isInstallment ? Number(formValues.installmentTotal) : null
    };

    await onSubmit(payload);
  }

  return (
    <section>
      <form ref={formRef} id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2">
            <Input label="Descrição" name="description" error={errors.description} value={formValues.description} onChange={handleChange} className={fieldClassName} />
          </div>

          <Input label="Valor" name="amount" type="number" step="0.01" min="0" error={errors.amount} value={formValues.amount} onChange={handleChange} className={fieldClassName} />

          <Input label="Data" name="transactionDate" type="date" error={errors.transactionDate} value={formValues.transactionDate} onChange={handleChange} className={fieldClassName} />

          <Select label="Tipo" name="type" value={formValues.type} onChange={handleChange} className={fieldClassName}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Status" name="status" value={formValues.status} onChange={handleChange} className={fieldClassName}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Método de pagamento" name="paymentMethod" value={formValues.paymentMethod} onChange={handleChange} className={fieldClassName}>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Categoria" name="categoryId" value={formValues.categoryId} onChange={handleChange} disabled={formValues.type === 'TRANSFER'} className={fieldClassName}>
            <option value="">{formValues.type === 'TRANSFER' ? 'Opcional para transferência' : 'Selecione uma categoria'}</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>

          {isCreditCardPayment ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition dark:border-slate-600/70 dark:bg-slate-800/40">
              <Select label="Cartão de crédito" name="creditCardId" error={errors.creditCardId} value={formValues.creditCardId} onChange={handleChange} disabled={!creditCards.length} className={fieldClassName}>
                <option value="">{creditCards.length ? 'Selecione um cartão' : 'Nenhum cartão disponível'}</option>
                {creditCards.map((creditCard) => (
                  <option key={creditCard.id} value={creditCard.id}>{creditCard.name}</option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Selecione o cartão usado nesta compra.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 transition dark:border-emerald-600/50 dark:bg-emerald-950/25">
              <Select label="Conta" name="accountId" error={errors.accountId} value={formValues.accountId} onChange={handleChange} className={fieldClassName}>
                <option value="">Selecione uma conta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Selecione a conta de onde saiu ou entrou o dinheiro.</p>
            </div>
          )}

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Observações</span>
            <textarea
              name="notes"
              value={formValues.notes}
              onChange={handleChange}
              className="h-20 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
              placeholder="Detalhes adicionais da transação"
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:border-slate-600/70 dark:bg-slate-700/30 dark:text-slate-300">
            <input name="isInstallment" type="checkbox" checked={formValues.isInstallment} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
            Transação parcelada
          </label>

          <p className="text-xs text-slate-400 dark:text-slate-500">Para lançamentos recorrentes, use a tela <strong className="text-slate-500 dark:text-slate-400">Recorrências</strong>.</p>
        </div>

        {formValues.isInstallment ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Número da parcela" name="installmentNumber" type="number" min="1" error={errors.installmentNumber} value={formValues.installmentNumber} onChange={handleChange} className={fieldClassName} />
            <Input label="Total de parcelas" name="installmentTotal" type="number" min="2" error={errors.installmentTotal} value={formValues.installmentTotal} onChange={handleChange} className={fieldClassName} />
          </div>
        ) : null}
      </form>
    </section>
  );
}

export default TransactionForm;
