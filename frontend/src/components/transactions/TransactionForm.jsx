import { useEffect, useRef, useState } from 'react';

import Input from '../ui/Input';
import Select from '../ui/Select';
import { formatCurrencyBRL } from '../../utils/formatters';
import { buildTransactionPayload, getInstallmentAmount } from '../../utils/transactionPayload';

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
    installmentTotal: transaction.installmentTotal ? String(transaction.installmentTotal) : ''
  };
}

function TransactionForm({ transaction, accounts, categories, creditCards, onSubmit, serverError, formId = 'transaction-form' }) {
  const formRef = useRef(null);
  const amountRef = useRef(null);
  const submittingRef = useRef(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [displayAmount, setDisplayAmount] = useState('');
  const [errors, setErrors] = useState({});
  const fieldClassName = 'h-11 py-0 text-sm';

  useEffect(() => {
    const values = buildFormValues(transaction);
    setFormValues(values);
    setErrors({});
    if (values.amount) {
      setDisplayAmount(formatCurrencyBRL(Number(values.amount)));
    } else {
      setDisplayAmount('');
    }
  }, [transaction]);

  useEffect(() => {
    if (amountRef.current && !transaction) {
      amountRef.current.focus();
    }
  }, [transaction]);

  const filteredCategories = categories.filter((category) => category.type === formValues.type);
  const isCreditCardPayment = formValues.paymentMethod === 'CREDIT_CARD';

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

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

      const nextPaymentMethod = name === 'paymentMethod' ? nextValue : nextValues.paymentMethod;
      const nextType = name === 'type' ? nextValue : nextValues.type;

      if (nextPaymentMethod !== 'CREDIT_CARD' || nextType !== 'EXPENSE') {
        nextValues.isInstallment = false;
        nextValues.installmentTotal = '';
      }

      if (name === 'isInstallment') {
        if (checked) {
          nextValues.installmentTotal = '2';
        } else {
          nextValues.installmentTotal = '';
        }
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

    if (submittingRef.current) {
      return;
    }

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
      const quantity = Number(formValues.installmentTotal);

      if (!Number.isInteger(quantity) || quantity < 2) {
        nextErrors.installmentTotal = 'Mínimo de 2 parcelas.';
      } else if (quantity > 360) {
        nextErrors.installmentTotal = 'Máximo de 360 parcelas.';
      } else if (Math.round((amount + Number.EPSILON) * 100) < quantity) {
        nextErrors.installmentTotal = 'O valor deve permitir parcelas de pelo menos R$ 0,01.';
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError();
      return;
    }

    submittingRef.current = true;

    try {
      await onSubmit(buildTransactionPayload(formValues));
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <section>
      <form ref={formRef} id={formId} className="space-y-6" onSubmit={handleSubmit}>
        {serverError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-400">
            {serverError}
          </div>
        ) : null}

        {/* Valor - hero */}
        <div>
          <label className="block">
            <span className="mb-2 block text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              💰 Valor
            </span>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700/40 dark:focus-within:border-emerald-500 dark:focus-within:ring-emerald-900/30">
              <input
                ref={amountRef}
                name="amount"
                type="text"
                autoFocus={!transaction}
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
          {/* Tipo */}
          <Select label="📝 Tipo" name="type" value={formValues.type} onChange={handleChange} className={fieldClassName}>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          {/* Status */}
          <Select label="✔️ Status" name="status" value={formValues.status} onChange={handleChange} className={fieldClassName}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          {/* Descrição */}
          <div className="md:col-span-2">
            <Input
              label="📝 Descrição"
              name="description"
              error={errors.description}
              value={formValues.description}
              onChange={handleChange}
              placeholder="Ex.: Salário, Freelance, Venda"
              className={fieldClassName}
            />
          </div>

          {/* Data */}
          <Input
            label="📅 Data"
            name="transactionDate"
            type="date"
            error={errors.transactionDate}
            value={formValues.transactionDate}
            onChange={handleChange}
            className={fieldClassName}
          />

          {/* Categoria */}
          <Select label="🏷️ Categoria" name="categoryId" value={formValues.categoryId} onChange={handleChange} disabled={formValues.type === 'TRANSFER'} className={fieldClassName}>
            <option value="">{formValues.type === 'TRANSFER' ? 'Opcional para transferência' : 'Selecione uma categoria'}</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>

          {/* Conta / Cartão */}
          {isCreditCardPayment ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition dark:border-slate-600/70 dark:bg-slate-800/40">
              <Select label="💳 Cartão" name="creditCardId" error={errors.creditCardId} value={formValues.creditCardId} onChange={handleChange} disabled={!creditCards.length} className={fieldClassName}>
                <option value="">{creditCards.length ? 'Selecione um cartão' : 'Nenhum cartão disponível'}</option>
                {creditCards.map((creditCard) => (
                  <option key={creditCard.id} value={creditCard.id}>{creditCard.name}</option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Selecione o cartão usado nesta compra.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 transition dark:border-emerald-600/50 dark:bg-emerald-950/25">
              <Select label="🏦 Conta" name="accountId" error={errors.accountId} value={formValues.accountId} onChange={handleChange} className={fieldClassName}>
                <option value="">Selecione uma conta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Selecione a conta de onde saiu ou entrou o dinheiro.</p>
            </div>
          )}

          {/* Método de pagamento */}
          <Select label="💳 Método de pagamento" name="paymentMethod" value={formValues.paymentMethod} onChange={handleChange} className={fieldClassName}>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          {/* Observações */}
          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">📋 Observações</span>
              <textarea
                name="notes"
                value={formValues.notes}
                onChange={handleChange}
                className="h-20 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                placeholder="Adicionar observação"
              />
            </label>
          </div>
        </div>

        {/* Parcelamento - abaixo do grid */}
        {isCreditCardPayment && formValues.type === 'EXPENSE' ? (
        <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-600/70 dark:bg-slate-700/30 dark:text-slate-300 dark:hover:border-slate-500/70">
            <input name="isInstallment" type="checkbox" checked={formValues.isInstallment} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 transition-colors dark:border-slate-500 dark:bg-slate-700" />
            🔄 Transação parcelada
          </label>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              formValues.isInstallment ? 'max-h-48 opacity-100 translate-y-0 mt-3' : 'max-h-0 opacity-0 -translate-y-2'
            }`}
          >
            <div className="space-y-4">
              <Input
                label="Quantidade de parcelas"
                name="installmentTotal"
                type="number"
                min="2"
                max="360"
                error={errors.installmentTotal}
                value={formValues.installmentTotal}
                onChange={handleChange}
                className={fieldClassName}
              />

              {(() => {
                const qty = Number(formValues.installmentTotal);
                const amt = Number(formValues.amount);

                if (!formValues.isInstallment || !Number.isInteger(qty) || qty < 2 || qty > 360 || !amt || amt <= 0) {
                  return null;
                }

                const parcelValue = getInstallmentAmount(amt, qty);

                return (
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm dark:border-emerald-600/50 dark:bg-emerald-950/25">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Resumo:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {qty}x de {formatCurrencyBRL(parcelValue)}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        ) : null}

        <p className="text-xs text-slate-400 dark:text-slate-500">Para lançamentos recorrentes, use a tela <strong className="text-slate-500 dark:text-slate-400">Recorrências</strong>.</p>
      </form>
    </section>
  );
}

export default TransactionForm;
