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
              role="option"
              aria-label={flow.label}
              onClick={() => handleClick(flow.id)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={cn(
                'flex h-[132px] flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200',
                'motion-safe:animate-fade-in-up',
                flow.highlight
                  ? 'border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:bg-emerald-500/20 dark:border-emerald-600/40 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50 dark:hover:border-slate-600'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-2xl',
                  flow.highlight
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {flow.label}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
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
