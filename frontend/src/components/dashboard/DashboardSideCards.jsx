import { ArrowLeftRight, CheckSquare, CreditCard, Landmark, ShieldCheck, TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react';

import { usePrivacy } from '../../contexts/PrivacyContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';

const quickActions = [
  { id: 'TRANSFER', label: 'Transferir', Icon: ArrowLeftRight, tone: 'bg-accent-purple/10 text-accent-purple' },
  { id: 'INCOME', label: 'Receita', Icon: TrendingUp, tone: 'bg-success/10 text-success' },
  { id: 'EXPENSE', label: 'Despesa', Icon: TrendingDown, tone: 'bg-danger/10 text-danger' },
  { id: 'CREDIT_CARD', label: 'Despesa no crédito', Icon: CreditCard, tone: 'bg-warning/10 text-warning' },
  { id: 'ACCOUNT', label: 'Nova conta', Icon: Landmark, tone: 'bg-info/10 text-info' }
];

function PendingAlertsCard({ financialTasks, invoiceSummary, totalBalance }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const tasksAvailable = financialTasks != null;
  const invoicesAvailable = invoiceSummary != null;
  const pending = financialTasks?.pending ?? financialTasks?.pendingTasks ?? 0;
  const overdue = financialTasks?.overdue ?? financialTasks?.overdueTasks ?? 0;
  const openInvoices = Number(invoiceSummary?.totalOpen) || 0;
  const overdueInvoices = Number(invoiceSummary?.overdueCount) || 0;
  const items = [
    {
      title: 'Tarefas pendentes',
      description: tasksAvailable ? 'Tarefas financeiras aguardando conclusão' : 'Dados temporariamente indisponíveis',
      value: tasksAvailable ? String(pending) : '--',
      Icon: CheckSquare,
      tone: 'bg-info/10 text-info'
    },
    {
      title: 'Tarefas atrasadas',
      description: tasksAvailable ? 'Itens que já passaram do prazo' : 'Dados temporariamente indisponíveis',
      value: tasksAvailable ? String(overdue) : '--',
      Icon: TriangleAlert,
      tone: 'bg-danger/10 text-danger'
    },
    {
      title: 'Faturas de cartão',
      description: invoicesAvailable ? (overdueInvoices > 0 ? `${overdueInvoices} fatura(s) vencida(s)` : 'Total em faturas não pagas') : 'Dados temporariamente indisponíveis',
      value: invoicesAvailable ? formatCurrencyPrivacy(openInvoices) : '--',
      Icon: CreditCard,
      tone: 'bg-accent-purple/10 text-accent-purple'
    },
    {
      title: 'Saldo disponível',
      description: 'Saldo real das contas consideradas no total',
      value: formatCurrencyPrivacy(totalBalance),
      Icon: ShieldCheck,
      tone: 'bg-surface-secondary text-content-secondary'
    }
  ];

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-[-0.02em] text-content-primary">Pendências e alertas</h2>
        <span className="text-xs font-semibold text-content-secondary">Agora</span>
      </div>
      <div className="mt-3 divide-y divide-border-soft">
        {items.map((item) => (
          <div key={item.title} className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${item.tone}`}>
              <item.Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-content-primary">{item.title}</span>
              <span className="mt-0.5 block truncate text-xs text-content-muted">{item.description}</span>
            </span>
            <span className="max-w-[128px] truncate text-right text-sm font-bold text-content-primary">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActionsCard({ onAction }) {
  const { tenant } = useAuth();
  const canWrite = tenant?.role !== 'READONLY';

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="text-lg font-bold tracking-[-0.02em] text-content-primary">Ações rápidas</h2>
      <div className="mt-4 grid grid-cols-5 gap-1 sm:gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action.id)}
            disabled={!canWrite}
            className="group flex min-w-0 flex-col items-center gap-2 rounded-xl px-1 py-1 text-center transition hover:-translate-y-0.5 hover:bg-surface-secondary active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:bg-transparent"
            aria-label={action.label}
            title={canWrite ? action.label : 'Seu perfil possui acesso somente para leitura'}
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-full transition group-hover:scale-105 sm:h-12 sm:w-12 ${action.tone}`}>
              <action.Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-h-7 text-[10px] font-semibold leading-3 text-content-primary sm:text-[11px]">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

export { PendingAlertsCard, QuickActionsCard };
