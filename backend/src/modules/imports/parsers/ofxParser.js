function parseOfxDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  // OFX format: YYYYMMDDHHMMSS or YYYYMMDD
  const y = Number(str.substring(0, 4));
  const m = Number(str.substring(4, 6)) - 1;
  const d = Number(str.substring(6, 8));
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  const date = new Date(y, m, d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function parseOfx(buffer) {
  const content = Buffer.isBuffer(buffer) ? buffer.toString('utf-8') : buffer;

  // Extract transactions between <STMTTRN> and </STMTTRN>
  const transactions = [];
  const stmtRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  let match;

  while ((match = stmtRegex.exec(content)) !== null) {
    const block = match[1];

    const getTag = (tag) => {
      const regex = new RegExp(`<${tag}>([^<]+)`);
      const m = block.match(regex);
      return m ? m[1].trim() : null;
    };

    const trnType = getTag('TRNTYPE');
    const dtPosted = getTag('DTPOSTED');
    const trnAmt = getTag('TRNAMT');
    const fitId = getTag('FITID');
    const name = getTag('NAME');
    const memo = getTag('MEMO');

    const description = name || memo || 'Transacao OFX';
    const amount = Number(trnAmt);
    const transactionDate = parseOfxDate(dtPosted);
    const isValid = !Number.isNaN(amount) && !!transactionDate;

    const errors = [];
    if (!transactionDate) errors.push('Data invalida ou ausente');
    if (Number.isNaN(amount)) errors.push('Valor invalido ou ausente');

    const type = amount >= 0 ? 'INCOME' : 'EXPENSE';
    const positiveAmount = Math.abs(amount || 0);

    transactions.push({
      externalId: fitId || `ofx_${transactions.length}`,
      description,
      amount: positiveAmount,
      type,
      transactionDate,
      paymentMethod: 'OTHER',
      suggestedCategoryId: null,
      suggestedCategoryName: null,
      status: 'CONFIRMED',
      source: 'OFX',
      isValid,
      errors
    });
  }

  const validRows = transactions.filter((t) => t.isValid).length;
  const invalidRows = transactions.filter((t) => !t.isValid).length;

  return {
    totalRows: transactions.length,
    validRows,
    invalidRows,
    transactions
  };
}

module.exports = { parseOfx };
