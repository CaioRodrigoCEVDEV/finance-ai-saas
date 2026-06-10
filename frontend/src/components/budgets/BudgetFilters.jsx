import Button from '../ui/Button';
import Card from '../ui/Card';
import Select from '../ui/Select';

const monthOptions = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Marco' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
];

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear - 3; year <= currentYear + 3; year += 1) {
    years.push(String(year));
  }

  return years;
}

function BudgetFilters({ filters, categories, onChange, onClear, loading }) {
  const yearOptions = getYearOptions();

  return (
    <Card className="rounded-[28px] border-slate-200/80 bg-white/95 p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-4 md:grid-cols-3">
          <Select label="Mes" name="month" value={filters.month} onChange={onChange} disabled={loading}>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Select label="Ano" name="year" value={filters.year} onChange={onChange} disabled={loading}>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>

          <Select label="Categoria" name="categoryId" value={filters.categoryId} onChange={onChange} disabled={loading}>
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClear} disabled={loading}>Limpar filtros</Button>
        </div>
      </div>
    </Card>
  );
}

export default BudgetFilters;
