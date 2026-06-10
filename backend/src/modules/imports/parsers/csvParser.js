const { parse } = require('csv-parse/sync');

function normalizeDate(value) {
  if (!value) return null;
  const str = String(value).trim();

  // Tenta ISO ou yyyy-mm-dd
  const iso = new Date(str);
  if (!Number.isNaN(iso.getTime())) {
    return iso.toISOString().split('T')[0];
  }

  // Tenta dd/mm/yyyy
  const br = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    const d = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }

  return null;
}

function normalizeAmount(value) {
  if (value === null || value === undefined || value === '') return null;
  let str = String(value)
    .replace(/R\$\s?/g, '')
    .trim();

  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    // Ambos presentes: o mais à direita é o decimal
    if (lastComma > lastDot) {
      // ponto = milhar, vírgula = decimal
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // vírgula = milhar, ponto = decimal
      str = str.replace(/,/g, '');
    }
  } else if (lastComma !== -1 && lastDot === -1) {
    // Apenas vírgula: decimal
    str = str.replace(',', '.');
  } else if (lastDot !== -1 && lastComma === -1) {
    // Apenas ponto: decimal (ou milhar se houver mais de um ponto)
    const dotCount = (str.match(/\./g) || []).length;
    if (dotCount > 1) {
      // provavelmente milhar
      str = str.replace(/\./g, '');
    }
    // se apenas um ponto, é decimal
  }

  const num = Number(str);
  if (Number.isNaN(num)) return null;
  return num;
}

function generateHash(row, index) {
  const raw = JSON.stringify(row) + index;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `csv_${Math.abs(hash).toString(16)}`;
}

function detectColumns(records) {
  if (!records || records.length === 0) return null;
  const first = records[0];
  const keys = Object.keys(first).map((k) => k.toLowerCase().trim());

  const dateKeys = ['data', 'date', 'transaction_date', 'dtposted', 'data_transacao'];
  const descKeys = ['descricao', 'description', 'historico', 'memo', 'name', 'detalhes', 'desc'];
  const amountKeys = ['valor', 'amount', 'value', 'trnamt', 'valor_transacao'];

  const find = (candidates) =>
    keys.find((k) => candidates.some((c) => k.includes(c))) || null;

  return {
    dateKey: find(dateKeys),
    descKey: find(descKeys),
    amountKey: find(amountKeys)
  };
}

function parseCsv(buffer) {
  const content = Buffer.isBuffer(buffer) ? buffer.toString('utf-8') : buffer;
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  });

  const columns = detectColumns(records);
  if (!columns || !columns.dateKey || !columns.descKey || !columns.amountKey) {
    const errors = [];
    if (!columns || !columns.dateKey) errors.push('Nao foi possivel detectar coluna de data');
    if (!columns || !columns.descKey) errors.push('Nao foi possivel detectar coluna de descricao');
    if (!columns || !columns.amountKey) errors.push('Nao foi possivel detectar coluna de valor');
    return {
      totalRows: records.length,
      validRows: 0,
      invalidRows: records.length,
      transactions: records.map((row, index) => ({
        externalId: generateHash(row, index),
        description: 'N/A',
        amount: 0,
        type: 'EXPENSE',
        transactionDate: null,
        paymentMethod: 'OTHER',
        suggestedCategoryId: null,
        suggestedCategoryName: null,
        status: 'CONFIRMED',
        source: 'CSV',
        isValid: false,
        errors
      }))
    };
  }

  const transactions = records.map((row, index) => {
    const errors = [];
    const rawDate = row[columns.dateKey];
    const rawDesc = row[columns.descKey];
    const rawAmount = row[columns.amountKey];

    const transactionDate = normalizeDate(rawDate);
    const description = String(rawDesc || '').trim();
    const amount = normalizeAmount(rawAmount);

    if (!transactionDate) errors.push('Data invalida ou ausente');
    if (!description) errors.push('Descricao ausente');
    if (amount === null) errors.push('Valor invalido ou ausente');

    const isValid = errors.length === 0;
    const numAmount = amount || 0;
    const type = numAmount >= 0 ? 'INCOME' : 'EXPENSE';
    const positiveAmount = Math.abs(numAmount);

    return {
      externalId: generateHash(row, index),
      description,
      amount: positiveAmount,
      type,
      transactionDate,
      paymentMethod: 'OTHER',
      suggestedCategoryId: null,
      suggestedCategoryName: null,
      status: 'CONFIRMED',
      source: 'CSV',
      isValid,
      errors
    };
  });

  const validRows = transactions.filter((t) => t.isValid).length;
  const invalidRows = transactions.filter((t) => !t.isValid).length;

  return {
    totalRows: transactions.length,
    validRows,
    invalidRows,
    transactions
  };
}

module.exports = { parseCsv };
