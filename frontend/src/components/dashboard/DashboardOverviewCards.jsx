import SummaryCard from './SummaryCard';
import { formatPercentage } from '../../utils/formatters';

function formatComparison(comparison) {
  if (!comparison) return null;

  const trend = comparison.trend || (comparison.percentage > 0 ? 'up' : comparison.percentage < 0 ? 'down' : 'flat');
  const signedValue = `${comparison.percentage > 0 ? '+' : comparison.percentage < 0 ? '-' : ''}${formatPercentage(Math.abs(comparison.percentage))}`;

  return {
    value: signedValue,
    label: 'versus mês anterior',
    trend,
    icon: trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•'
  };
}

function DashboardOverviewCards({ data, tenantName, periodLabel, comparison }) {
  if (!data) return null;

  const cards = [
    {
      title: 'Saldo total',
      value: Number(data.totalBalance) || 0,
      description: `Posição consolidada das contas de ${tenantName || 'Finance AI'} até ${periodLabel || 'o período selecionado'}.`,
      variant: 'highlight',
      cardType: 'balance',
      comparison: formatComparison(comparison?.totalBalance)
    },
    {
      title: 'Receitas do período',
      value: Number(data.monthlyIncome) || 0,
      description: `Entradas confirmadas em ${periodLabel || 'o período selecionado'}.`,
      variant: 'positive',
      cardType: 'income',
      comparison: formatComparison(comparison?.monthlyIncome)
    },
    {
      title: 'Despesas do período',
      value: Number(data.monthlyExpensePaid) || 0,
      description: `Saídas efetivamente pagas em ${periodLabel || 'o período selecionado'}.`,
      variant: 'negative',
      cardType: 'expense',
      comparison: formatComparison(comparison?.monthlyExpensePaid)
    },
    {
      title: 'Economia do período',
      value: Number(data.monthlyEconomy) || 0,
      description: `Receitas menos despesas pagas em ${periodLabel || 'o período selecionado'}.`,
      variant: (Number(data.monthlyEconomy) || 0) >= 0 ? 'positive' : 'negative',
      cardType: 'savings',
      comparison: formatComparison(comparison?.monthlyEconomy)
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
