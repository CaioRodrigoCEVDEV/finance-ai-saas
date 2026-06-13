import MetricCard from '../MetricCard';

import { usePrivacy } from '../../contexts/PrivacyContext';

function TransactionSummaryCards({ summary }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Receitas do mês" value={formatCurrencyPrivacy(summary.income)} description="Entradas confirmadas no mês atual." />
      <MetricCard title="Despesas do mês" value={formatCurrencyPrivacy(summary.expense)} description="Saídas confirmadas do workspace atual." />
      <MetricCard title="Investimentos do mês" value={formatCurrencyPrivacy(summary.investment)} description="Aportes confirmados do período." />
      <MetricCard title="Saldo do mês" value={formatCurrencyPrivacy(summary.balance)} description={`${summary.totalTransactions || 0} transações confirmadas no período.`} />
    </div>
  );
}

export default TransactionSummaryCards;
