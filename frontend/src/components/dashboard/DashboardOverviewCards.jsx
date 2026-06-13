import SummaryCard from './SummaryCard';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatPercentage } from '../../utils/formatters';

function DashboardOverviewCards({ data, tenantName }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!data) return null;

  const cards = [
    {
      title: 'Saldo total',
      value: formatCurrencyPrivacy(data.totalBalance),
      description: `Posição consolidada das contas de ${tenantName || 'Finance AI'}.`,
      variant: 'highlight'
    },
    {
      title: 'Receitas do mês',
      value: formatCurrencyPrivacy(data.monthlyIncome),
      description: 'Entradas confirmadas no mês atual.',
      variant: 'positive'
    },
    {
      title: 'Despesas do mês',
      value: formatCurrencyPrivacy(data.monthlyExpense),
      description: `${formatPercentage(data.expensePercentage)} da receita mensal.`,
      variant: 'negative'
    },
    {
      title: 'Economia do mês',
      value: formatCurrencyPrivacy(data.monthlyEconomy),
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
