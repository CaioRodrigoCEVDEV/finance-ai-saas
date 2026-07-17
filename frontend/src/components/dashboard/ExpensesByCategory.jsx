import { Layers3 } from 'lucide-react';
import DashboardCard from '../ui/DashboardCard';
import ExpenseCategoryList from './ExpenseCategoryList';

function ExpensesByCategory({ items, periodLabel }) {
  return (
    <DashboardCard
      icon={Layers3}
      title="Gastos por categoria"
      description={`Distribuição das despesas em ${periodLabel || 'o período selecionado'}`}
      color="emerald"
    >
      <ExpenseCategoryList items={items} />
    </DashboardCard>
  );
}

export default ExpensesByCategory;
