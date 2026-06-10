const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const percentageFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export function formatCurrencyBRL(value) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatDateBR(date) {
  if (!date) {
    return '--';
  }

  return dateFormatter.format(new Date(date));
}

export function formatPercentage(value) {
  return `${percentageFormatter.format(Number(value || 0))}%`;
}

export function formatTransactionType(type) {
  const labels = {
    INCOME: 'Receita',
    EXPENSE: 'Despesa',
    TRANSFER: 'Transferencia',
    INVESTMENT: 'Investimento'
  };

  return labels[type] || type || '--';
}

export function formatTransactionStatus(status) {
  const labels = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmada',
    CANCELED: 'Cancelada'
  };

  return labels[status] || status || '--';
}

export function formatPaymentMethod(method) {
  const labels = {
    PIX: 'Pix',
    DEBIT_CARD: 'Cartao de debito',
    CREDIT_CARD: 'Cartao de credito',
    CASH: 'Dinheiro',
    BANK_SLIP: 'Boleto',
    TRANSFER: 'Transferencia',
    OTHER: 'Outro'
  };

  return labels[method] || method || '--';
}
