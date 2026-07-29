import {
  ArrowLeftRight,
  CreditCard,
  FileUp,
  Repeat,
  Target,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '../../utils/cn';

const FLOWS = [
  {
    id: 'INCOME',
    label: 'Nova receita',
    description: 'Adicionar entrada de dinheiro',
    icon: TrendingUp,
    highlight: true
  },
  {
    id: 'EXPENSE',
    label: 'Nova despesa',
    description: 'Registrar um gasto',
    icon: TrendingDown
  },
  {
    id: 'CREDIT_CARD',
    label: 'Gasto no cartão',
    description: 'Lançar compra no crédito',
    icon: CreditCard
  },
  {
    id: 'TRANSFER',
    label: 'Transferência',
    description: 'Mover dinheiro entre contas',
    icon: ArrowLeftRight
  },
  {
    id: 'RECURRENCE',
    label: 'Recorrência',
    description: 'Lançamentos automáticos',
    icon: Repeat
  },
  {
    id: 'GOAL',
    label: 'Nova meta',
    description: 'Criar objetivo financeiro',
    icon: Target
  },
  {
    id: 'IMPORT',
    label: 'Importar',
    description: 'Importar extrato bancário',
    icon: FileUp,
    premium: true
  }
];

function QuickAddMenu({ onSelect }) {
  const navigate = useNavigate();

  function handleClick(flowId) {
    if (flowId === 'IMPORT') {
      navigate('/imports');
      return;
    }
    onSelect(flowId);
  }

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {FLOWS.map((flow, index) => {
          const Icon = flow.icon;

          return (
            <button
              key={flow.id}
              type="button"
              aria-label={flow.label}
              onClick={() => handleClick(flow.id)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={cn(
                'flex h-[126px] flex-col items-center justify-center gap-2 rounded-[16px] border p-4 text-center transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
                'motion-safe:animate-fade-in-up',
                flow.highlight
                  ? 'border-primary/30 bg-primary/10 hover:-translate-y-0.5 hover:bg-primary/15'
                  : 'border-border-soft bg-surface hover:-translate-y-0.5 hover:border-primary/20 hover:bg-surface-hover'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  flow.highlight
                    ? 'bg-primary/15 text-primary'
                    : 'bg-surface-secondary text-content-secondary'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-content-primary">
                  {flow.label}
                </p>
                <p className="mt-0.5 text-[11px] text-content-muted">
                  {flow.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default QuickAddMenu;
