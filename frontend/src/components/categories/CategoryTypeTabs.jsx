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
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-violet-400 text-slate-950' : 'border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryTypeTabs;
