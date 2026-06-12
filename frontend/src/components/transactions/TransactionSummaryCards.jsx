import MetricCard from '../MetricCard';

import { formatCurrencyBRL } from '../../utils/formatters';

function TransactionSummaryCards({ summary }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Receitas do mês" value={formatCurrencyBRL(summary.income)} description="Entradas confirmadas no mês atual." />
      <MetricCard title="Despesas do mês" value={formatCurrencyBRL(summary.expense)} description="Saídas confirmadas do workspace atual." />
      <MetricCard title="Investimentos do mês" value={formatCurrencyBRL(summary.investment)} description="Aportes confirmados do período." />
      <MetricCard title="Saldo do mês" value={formatCurrencyBRL(summary.balance)} description={`${summary.totalTransactions || 0} transações confirmadas no período.`} />
    </div>
  );
}

export default TransactionSummaryCards;
