import { Search, X } from 'lucide-react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const statusOptions = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'COMPLETED', label: 'Concluidas' }
];

const priorityOptions = [
  { value: '', label: 'Todas' },
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' }
];

const presetOptions = [
  { value: '', label: 'Todas', icon: null },
  { value: 'pending', label: 'Pendentes', icon: null },
  { value: 'completed', label: 'Concluidas', icon: null }
];

function FinancialTaskFilters({ filters, onChange, onClear, onPreset, loading }) {
  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-auto sm:flex-1 sm:min-w-0">
          <Input
            label="Buscar"
            name="search"
            placeholder="Ex.: revisar contrato, pagar aluguel..."
            value={filters.search}
            onChange={onChange}
            icon={Search}
          />
        </div>

        <div className="w-full sm:w-auto sm:flex-1 sm:min-w-0">
          <Select label="Status" name="status" value={filters.status} onChange={onChange}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>

        <div className="w-full sm:w-auto sm:flex-1 sm:min-w-0">
          <Select label="Prioridade" name="priority" value={filters.priority} onChange={onChange}>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>

        <Button variant="secondary" onClick={onClear} disabled={loading} className="w-full sm:w-auto">
          <X className="h-4 w-4" />
          Limpar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {presetOptions.map((preset) => (
          <Button
            key={preset.value}
            variant={filters.preset === preset.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onPreset(preset.value)}
            disabled={loading}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default FinancialTaskFilters;
