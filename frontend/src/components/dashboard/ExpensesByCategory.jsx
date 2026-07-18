import { Layers3 } from 'lucide-react';
import DashboardCard from '../ui/DashboardCard';
import ExpenseCategoryList from './ExpenseCategoryList';

function ExpensesByCategory({ items, periodLabel, collapseKey }) {
  return (
    <DashboardCard
      icon={Layers3}
      title="Gastos por categoria"
      description={`Distribuição das despesas em ${periodLabel || 'o período selecionado'}`}
      color="emerald"
      collapseKey={collapseKey}
    >
      <ExpenseCategoryList items={items} />
    </DashboardCard>
  );
}

export default ExpensesByCategory;
