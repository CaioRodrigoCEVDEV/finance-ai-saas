import { Pencil, Trash2 } from 'lucide-react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

const matchTypeLabels = {
  CONTAINS: 'Contem',
  STARTS_WITH: 'Comeca com',
  ENDS_WITH: 'Termina com',
  EQUALS: 'Igual a',
  REGEX: 'Regex'
};

function CategorizationRuleCard({ rule, onEdit, onDelete }) {
  return (
    <Card className="flex flex-col gap-4 rounded-[28px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">{rule.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {matchTypeLabels[rule.matchType] || rule.matchType} "{rule.matchText}"
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(rule)} aria-label="Editar regra">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(rule)} aria-label="Excluir regra">
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {rule.category?.name || 'Categoria desconhecida'}
        </Badge>
        <Badge variant="outline">
          Prioridade {rule.priority}
        </Badge>
        {rule.isActive ? (
          <Badge variant="success">Ativa</Badge>
        ) : (
          <Badge variant="danger">Inativa</Badge>
        )}
      </div>
    </Card>
  );
}

export default CategorizationRuleCard;
