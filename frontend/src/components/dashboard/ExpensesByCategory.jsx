import { Layers3 } from 'lucide-react';
import Card from '../ui/Card';
import ExpenseCategoryList from './ExpenseCategoryList';

function ExpensesByCategory({ items }) {
  return (
    <Card className="rounded-[28px] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Layers3 className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Gastos por categoria</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Distribuicao das despesas confirmadas no mes.</p>
        </div>
      </div>
      <ExpenseCategoryList items={items} />
    </Card>
  );
}

export default ExpensesByCategory;
