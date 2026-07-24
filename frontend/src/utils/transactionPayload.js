export function getInstallmentAmount(totalAmount, installmentTotal, installmentIndex = 0) {
  const totalCents = Math.round((Number(totalAmount) + Number.EPSILON) * 100);
  const baseAmount = Math.floor(totalCents / installmentTotal);
  const remainder = totalCents % installmentTotal;

  return (baseAmount + (installmentIndex < remainder ? 1 : 0)) / 100;
}

export function buildTransactionPayload(formValues) {
  const isCreditCardPayment = formValues.paymentMethod === 'CREDIT_CARD';
  const isInstallment = isCreditCardPayment && formValues.type === 'EXPENSE' && formValues.isInstallment;

  return {
    description: formValues.description.trim(),
    amount: Number(formValues.amount),
    type: formValues.type,
    status: formValues.status,
    transactionDate: formValues.transactionDate,
    paymentMethod: formValues.paymentMethod,
    accountId: isCreditCardPayment ? null : (formValues.accountId || null),
    creditCardId: isCreditCardPayment ? (formValues.creditCardId || null) : null,
    categoryId: formValues.categoryId || null,
    notes: formValues.notes.trim() || null,
    isInstallment,
    ...(isInstallment ? { installmentTotal: Number(formValues.installmentTotal) } : {})
  };
}
