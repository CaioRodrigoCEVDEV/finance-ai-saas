import SummaryCard from './SummaryCard';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatPercentage } from '../../utils/formatters';

function formatComparison(comparison) {
  if (!comparison) return null;

  const trend = comparison.trend || (comparison.percentage > 0 ? 'up' : comparison.percentage < 0 ? 'down' : 'flat');
  const signedValue = `${comparison.percentage > 0 ? '+' : comparison.percentage < 0 ? '-' : ''}${formatPercentage(Math.abs(comparison.percentage))}`;

  return {
    value: signedValue,
    label: 'versus mês anterior',
    icon: trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•',
    tone: trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-slate-500 dark:text-slate-400'
  };
}

function DashboardOverviewCards({ data, tenantName, periodLabel, comparison }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!data) return null;

  const cards = [
    {
      title: 'Saldo total',
      value: formatCurrencyPrivacy(data.totalBalance),
      description: `Posição consolidada das contas de ${tenantName || 'Finance AI'} até ${periodLabel || 'o período selecionado'}.`,
      variant: 'highlight',
      comparison: formatComparison(comparison?.totalBalance)
    },
    {
      title: 'Receitas do período',
      value: formatCurrencyPrivacy(data.monthlyIncome),
      description: `Entradas confirmadas em ${periodLabel || 'o período selecionado'}.`,
      variant: 'positive',
      comparison: formatComparison(comparison?.monthlyIncome)
    },
    {
      title: 'Despesas do período',
      value: formatCurrencyPrivacy(data.monthlyExpensePaid),
      description: `Saídas efetivamente pagas em ${periodLabel || 'o período selecionado'}.`,
      variant: 'negative',
      comparison: formatComparison(comparison?.monthlyExpensePaid)
    },
    {
      title: 'Economia do período',
      value: formatCurrencyPrivacy(data.monthlyEconomy),
      description: `Receitas menos despesas pagas em ${periodLabel || 'o período selecionado'}.`,
      variant: data.monthlyEconomy >= 0 ? 'positive' : 'negative',
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
