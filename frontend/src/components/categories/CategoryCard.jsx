const TYPE_LABELS = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferencia',
  INVESTMENT: 'Investimento'
};

function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-sm">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: category.color || '#8b5cf6' }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
              {TYPE_LABELS[category.type] || category.type}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.isDefault ? 'bg-amber-500/15 text-amber-300' : 'bg-violet-500/15 text-violet-200'}`}>
              {category.isDefault ? 'Padrao' : 'Personalizada'}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              {category.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-semibold text-white">{category.name}</h3>
          <p className="mt-2 text-sm text-slate-400">
            Icone: <span className="font-medium text-slate-200">{category.icon || 'Nao definido'}</span>
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-xs font-semibold uppercase text-slate-200">
          {category.icon ? category.icon.slice(0, 2) : '--'}
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-3xl border border-white/5 bg-black/20 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Cor</p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="h-5 w-5 rounded-full border border-white/10"
              style={{ backgroundColor: category.color || '#8b5cf6' }}
            />
            <p className="text-sm font-medium text-slate-200">{category.color || 'Nao definida'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Categoria pai</p>
          <p className="mt-3 text-sm font-medium text-slate-200">{category.parentName || 'Sem categoria pai'}</p>
        </div>
      </div>

      {!category.isDefault ? (
        <div className="mt-6 flex items-center justify-end gap-3 text-sm text-slate-400">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="rounded-2xl border border-slate-700 px-4 py-2 font-medium text-white transition hover:border-violet-400 hover:text-violet-200"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="rounded-2xl border border-rose-500/40 px-4 py-2 font-medium text-rose-200 transition hover:border-rose-400 hover:text-white"
          >
            Excluir
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default CategoryCard;
