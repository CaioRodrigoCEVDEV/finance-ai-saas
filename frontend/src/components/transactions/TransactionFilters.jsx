import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

const TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'TRANSFER', label: 'Transferência' },
  { value: 'INVESTMENT', label: 'Investimento' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'CANCELED', label: 'Cancelada' }
];

const ORIGIN_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'account', label: 'Conta bancária' },
  { value: 'credit_card', label: 'Cartão de crédito' }
];

const PRESETS = [
  { key: 'today', label: 'Hoje' },
  { key: 'last7', label: 'Últimos 7 dias' },
  { key: 'last30', label: 'Últimos 30 dias' },
  { key: 'thisMonth', label: 'Este mês' },
  { key: 'lastMonth', label: 'Mês anterior' },
  { key: 'last3Months', label: 'Últimos 3 meses' },
  { key: 'thisYear', label: 'Este ano' },
  { key: 'custom', label: 'Personalizado' }
];

function TransactionFilters({ filters, accounts, categories, creditCards, loading, onChange, onClear, onPeriodPreset }) {
  const showAccountFilter = !filters.origin || filters.origin === 'account';
  const showCreditCardFilter = !filters.origin || filters.origin === 'credit_card';

  return (
    <Card className="rounded-[28px] p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <Input label="Busca" name="search" placeholder="Descrição ou observações" value={filters.search} onChange={onChange} />
        </div>

        <Select label="Origem" name="origin" value={filters.origin} onChange={onChange}>
          {ORIGIN_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>{option.label}</option>
          ))}
        </Select>

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

        {showAccountFilter && (
          <Select label="Conta" name="accountId" value={filters.accountId} onChange={onChange}>
            <option value="">Todas as contas</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>
        )}

        {showCreditCardFilter && (
          <Select label="Cartão" name="creditCardId" value={filters.creditCardId} onChange={onChange}>
            <option value="">Todos os cartões</option>
            {creditCards.map((card) => (
              <option key={card.id} value={card.id}>{card.name}</option>
            ))}
          </Select>
        )}

        <Select label="Categoria" name="categoryId" value={filters.categoryId} onChange={onChange}>
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>

        <Input label="Data inicial" name="startDate" type="date" value={filters.startDate} onChange={onChange} />
        <Input label="Data final" name="endDate" type="date" value={filters.endDate} onChange={onChange} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => onPeriodPreset(preset.key)}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={onClear} disabled={loading}>Limpar filtros</Button>
      </div>
    </Card>
  );
}

export default TransactionFilters;
