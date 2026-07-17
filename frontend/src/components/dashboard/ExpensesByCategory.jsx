import { Layers3 } from 'lucide-react';
import Card from '../ui/Card';
import ExpenseCategoryList from './ExpenseCategoryList';

function ExpensesByCategory({ items, periodLabel }) {
  return (
    <Card className="rounded-[28px] border-white/10 bg-gradient-to-br from-white to-white/80 p-6
      dark:from-slate-800 dark:to-slate-800/80
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:scale-[1.01]
      hover:shadow-glow dark:hover:shadow-glow-dark hover:border-emerald-200
      dark:hover:border-emerald-800
      group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 transition-shadow duration-300 group-hover:shadow-md">
            <Layers3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Gastos por categoria</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Distribuição das despesas em {periodLabel || 'o período selecionado'}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <ExpenseCategoryList items={items} />
      </div>
    </Card>
  );
}

export default ExpensesByCategory;
