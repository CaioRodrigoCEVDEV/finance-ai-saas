import MetricCard from '../MetricCard';

import { usePrivacy } from '../../contexts/PrivacyContext';

function TransactionSummaryCards({ summary }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  return (
    <div className="grid gap-5 md:grid-cols-2 min-[1521px]:grid-cols-4">
      <MetricCard title="Receitas do mês" value={formatCurrencyPrivacy(summary.income)} description="Entradas confirmadas no mês atual." />
      <MetricCard title="Despesas do mês" value={formatCurrencyPrivacy(summary.expensePaid)} description="Saídas efetivamente pagas no período." />
      <MetricCard title="Gastos no cartão" value={formatCurrencyPrivacy(summary.creditCardSpent)} description="Compras realizadas no cartão de crédito." />
      <MetricCard title="Saldo do mês" value={formatCurrencyPrivacy(summary.balance)} description={`${summary.totalTransactions || 0} transações confirmadas no período.`} />
    </div>
  );
}

export default TransactionSummaryCards;
