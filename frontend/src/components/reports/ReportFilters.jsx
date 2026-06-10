import { Filter, RotateCcw } from 'lucide-react';

import Button from '../ui/Button';
import Card from '../ui/Card';

function ReportFilters({
  filters,
  accounts,
  creditCards,
  categories,
  onChange,
  onApply,
  onClear
}) {
  return (
    <Card className="p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="startDate">Data inicial</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={onChange}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="endDate">Data final</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={onChange}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="accountId">Conta</label>
          <select
            id="accountId"
            name="accountId"
            value={filters.accountId}
            onChange={onChange}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">Todas as contas</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="creditCardId">Cartao</label>
          <select
            id="creditCardId"
            name="creditCardId"
            value={filters.creditCardId}
            onChange={onChange}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">Todos os cartoes</option>
            {creditCards.map((card) => (
              <option key={card.id} value={card.id}>{card.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="categoryId">Categoria</label>
          <select
            id="categoryId"
            name="categoryId"
            value={filters.categoryId}
            onChange={onChange}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="type">Tipo</label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={onChange}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">Todos os tipos</option>
            <option value="INCOME">Receita</option>
            <option value="EXPENSE">Despesa</option>
            <option value="INVESTMENT">Investimento</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
        </div>

        <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-2">
          <Button onClick={onApply} className="w-full">
            <Filter className="h-4 w-4" />
            Aplicar filtros
          </Button>
          <Button variant="secondary" onClick={onClear} className="w-full">
            <RotateCcw className="h-4 w-4" />
            Limpar
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ReportFilters;
