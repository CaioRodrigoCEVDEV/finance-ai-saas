import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

const TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'INVESTMENT', label: 'Investimento' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'CANCELED', label: 'Cancelada' }
];

function TransactionFilters({ filters, accounts, categories, loading, onChange, onClear }) {
  return (
    <Card className="rounded-[28px] p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <Input label="Busca" name="search" placeholder="Descricao ou observacoes" value={filters.search} onChange={onChange} />
        </div>

        <Select label="Tipo" name="type" value={filters.type} onChange={onChange}>
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>{option.label}</option>
          ))}
        </Select>

        <Select label="Status" name="status" value={filters.status} onChange={onChange}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>{option.label}</option>
          ))}
        </Select>

        <Select label="Conta" name="accountId" value={filters.accountId} onChange={onChange}>
          <option value="">Todas as contas</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </Select>

        <Select label="Categoria" name="categoryId" value={filters.categoryId} onChange={onChange}>
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>

        <Input label="Data inicial" name="startDate" type="date" value={filters.startDate} onChange={onChange} />
        <Input label="Data final" name="endDate" type="date" value={filters.endDate} onChange={onChange} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={onClear} disabled={loading}>Limpar filtros</Button>
      </div>
    </Card>
  );
}

export default TransactionFilters;
