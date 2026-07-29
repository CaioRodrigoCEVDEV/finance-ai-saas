import { Filter, RotateCcw } from 'lucide-react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Select from '../ui/Select';

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
      <div className="grid gap-4 sm:grid-cols-2 min-[1521px]:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="startDate">Data inicial</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={onChange}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 !text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30 sm:!text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="endDate">Data final</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={onChange}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 !text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30 sm:!text-sm"
          />
        </div>

        <div>
          <Select
            className="h-11 !py-0"
            id="accountId"
            label="Conta"
            name="accountId"
            value={filters.accountId}
            onChange={onChange}
          >
            <option value="">Todas as contas</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            className="h-11 !py-0"
            id="creditCardId"
            label="Cartao"
            name="creditCardId"
            value={filters.creditCardId}
            onChange={onChange}
          >
            <option value="">Todos os cartoes</option>
            {creditCards.map((card) => (
              <option key={card.id} value={card.id}>{card.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            className="h-11 !py-0"
            id="categoryId"
            label="Categoria"
            name="categoryId"
            value={filters.categoryId}
            onChange={onChange}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            className="h-11 !py-0"
            id="type"
            label="Tipo"
            name="type"
            value={filters.type}
            onChange={onChange}
          >
            <option value="">Todos os tipos</option>
            <option value="INCOME">Receita</option>
            <option value="EXPENSE">Despesa</option>
            <option value="INVESTMENT">Investimento</option>
            <option value="TRANSFER">Transferencia</option>
          </Select>
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
