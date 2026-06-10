import SummaryCard from './SummaryCard';
import { formatCurrencyBRL, formatPercentage } from '../../utils/formatters';

function DashboardOverviewCards({ data, tenantName }) {
  if (!data) return null;

  const cards = [
    {
      title: 'Saldo total',
      value: formatCurrencyBRL(data.totalBalance),
      description: `Posição consolidada das contas de ${tenantName || 'Finance AI'}.`,
      variant: 'highlight'
    },
    {
      title: 'Receitas do mês',
      value: formatCurrencyBRL(data.monthlyIncome),
      description: 'Entradas confirmadas no mês atual.',
      variant: 'positive'
    },
    {
      title: 'Despesas do mês',
      value: formatCurrencyBRL(data.monthlyExpense),
      description: `${formatPercentage(data.expensePercentage)} da receita mensal.`,
      variant: 'negative'
    },
    {
      title: 'Economia do mês',
      value: formatCurrencyBRL(data.monthlyEconomy),
      description: 'Receitas menos despesas e investimentos confirmados.',
      variant: data.monthlyEconomy >= 0 ? 'positive' : 'negative'
    }
  ];

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.title} {...card} />
      ))}
    </section>
  );
}

export default DashboardOverviewCards;
