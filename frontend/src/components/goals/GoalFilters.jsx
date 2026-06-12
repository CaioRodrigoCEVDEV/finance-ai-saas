import { Search, X } from 'lucide-react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Ativas' },
  { value: 'COMPLETED', label: 'Concluidas' },
  { value: 'CANCELED', label: 'Canceladas' }
];

function GoalFilters({ filters, onChange, onClear, loading }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full sm:w-auto sm:min-w-[200px]">
        <Input
          label="Buscar"
          name="search"
          placeholder="Nome ou descrição"
          value={filters.search}
          onChange={onChange}
          icon={Search}
        />
      </div>

      <div className="w-full sm:w-auto sm:min-w-[180px]">
        <Select label="Status" name="status" value={filters.status} onChange={onChange}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
      </div>

      <Button variant="secondary" onClick={onClear} disabled={loading}>
        <X className="h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}

export default GoalFilters;
