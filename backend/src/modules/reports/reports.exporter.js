function escapeCsv(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

function toCsv(transactions) {
  const headers = [
    'Data',
    'Descricao',
    'Tipo',
    'Status',
    'Categoria',
    'Conta',
    'Cartao',
    'Forma de pagamento',
    'Valor',
    'Origem',
    'Observacoes'
  ];

  const rows = transactions.map((t) => {
    const transactionDate = t.transaction_date
      ? new Date(t.transaction_date).toLocaleDateString('pt-BR')
      : '';

    return [
      escapeCsv(transactionDate),
      escapeCsv(t.description),
      escapeCsv(t.type),
      escapeCsv(t.status),
      escapeCsv(t.category ? t.category.name : ''),
      escapeCsv(t.account ? t.account.name : ''),
      escapeCsv(t.credit_card ? t.credit_card.name : ''),
      escapeCsv(t.payment_method),
      escapeCsv(Number(t.amount || 0).toFixed(2).replace('.', ',')),
      escapeCsv(t.source),
      escapeCsv(t.notes || '')
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\n');
}

module.exports = {
  toCsv
};
