import { cn } from '../../utils/cn';

const CATEGORY_TABS = [
  { value: 'ALL', label: 'Todas' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'EXPENSE', label: 'Despesas' },
  { value: 'TRANSFER', label: 'Transferencias' },
  { value: 'INVESTMENT', label: 'Investimentos' }
];

function CategoryTypeTabs({ activeType, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {CATEGORY_TABS.map((tab) => {
        const isActive = tab.value === activeType;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryTypeTabs;
