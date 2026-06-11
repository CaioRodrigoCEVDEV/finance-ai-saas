import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

const TYPE_LABELS = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferencia',
  INVESTMENT: 'Investimento'
};

function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <Card className="relative overflow-hidden rounded-[28px] p-6">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: category.color || '#10b981' }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {TYPE_LABELS[category.type] || category.type}
            </span>
            <Badge variant={category.isDefault ? 'warning' : 'info'}>{category.isDefault ? 'Padrao' : 'Personalizada'}</Badge>
            <Badge variant={category.isActive ? 'success' : 'neutral'}>{category.isActive ? 'Ativa' : 'Inativa'}</Badge>
          </div>

          <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">{category.name}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Icone: <span className="font-medium text-slate-700 dark:text-slate-300">{category.icon || 'Nao definido'}</span>
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          {category.icon ? category.icon.slice(0, 2) : '--'}
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 dark:border-slate-600 dark:bg-slate-800/50">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Cor</p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="h-5 w-5 rounded-full border border-slate-200 dark:border-slate-500"
              style={{ backgroundColor: category.color || '#10b981' }}
            />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{category.color || 'Nao definida'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Categoria pai</p>
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">{category.parentName || 'Sem categoria pai'}</p>
        </div>
      </div>

      {!category.isDefault ? (
        <div className="mt-6 flex items-center justify-end gap-3 text-sm text-slate-500">
          <Button variant="secondary" size="sm" onClick={() => onEdit(category)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(category)} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            Excluir
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export default CategoryCard;
