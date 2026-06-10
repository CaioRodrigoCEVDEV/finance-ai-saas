import MetricCard from '../MetricCard';

import { formatCurrencyBRL } from '../../utils/formatters';

function TransactionSummaryCards({ summary }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Receitas do mes" value={formatCurrencyBRL(summary.income)} description="Entradas confirmadas no mes atual." />
      <MetricCard title="Despesas do mes" value={formatCurrencyBRL(summary.expense)} description="Saidas confirmadas do tenant atual." />
      <MetricCard title="Investimentos do mes" value={formatCurrencyBRL(summary.investment)} description="Aportes confirmados do periodo." />
      <MetricCard title="Saldo do mes" value={formatCurrencyBRL(summary.balance)} description={`${summary.totalTransactions || 0} transacoes confirmadas no periodo.`} />
    </div>
  );
}

export default TransactionSummaryCards;
