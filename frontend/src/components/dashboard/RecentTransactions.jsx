import { Clock, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatDateBR } from '../../utils/formatters';
import { getCategoryIcon, getCategoryColor } from '../../utils/categoryIcons';

const typeConfig = {
  INCOME: {
    label: 'Receita',
    badge: 'success',
    Icon: ArrowUpRight,
    prefix: '+',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  EXPENSE: {
    label: 'Despesa',
    badge: 'danger',
    Icon: ArrowDownRight,
    prefix: '-',
    text: 'text-rose-600 dark:text-rose-400',
  },
  TRANSFER: {
    label: 'Transferência',
    badge: 'info',
    Icon: ArrowRightLeft,
    prefix: '',
    text: 'text-blue-600 dark:text-blue-400',
  },
};

function parseDateSafe(dateStr) {
  if (!dateStr) return null;
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0, 0);
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toGroupKey(dateStr) {
  const d = parseDateSafe(dateStr);
  if (!d) return 'outros';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateGroup(dateStr) {
  const d = parseDateSafe(dateStr);
  if (!d) return dateStr || 'Sem data';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const groupDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((today - groupDate) / 86400000);

  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return `${diff} dias atrás`;

  return formatDateBR(dateStr);
}

function groupByDate(transactions) {
  const groups = new Map();
  for (const t of transactions) {
    const key = toGroupKey(t.transactionDate);
    if (!groups.has(key)) {
      groups.set(key, { date: t.transactionDate, items: [] });
    }
    groups.get(key).items.push(t);
  }
  return Array.from(groups.values());
}

function TransactionItem({ transaction }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const config = typeConfig[transaction.type] || typeConfig.EXPENSE;
  const Icon = getCategoryIcon(transaction.categoryName);
  const catColor = getCategoryColor(transaction.categoryName);
  const accountLabel = transaction.accountName || transaction.creditCardName || 'Sem conta';
  const isExpense = transaction.type === 'EXPENSE';

  return (
    <article
      className="group flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white/60 px-4 py-3.5
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)]
        dark:border-slate-700/40 dark:bg-slate-800/20 dark:hover:border-slate-600/50 dark:hover:bg-slate-800/40 dark:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)]"
    >
      {/* Ícone circular da categoria */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${catColor.bg}`}>
        <Icon className={`h-5 w-5 ${catColor.text}`} strokeWidth={1.75} aria-hidden="true" />
      </div>

      {/* Centro: Nome + Meta info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{transaction.description}</p>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="truncate">{transaction.categoryName}</span>
          <span className="shrink-0 opacity-40">·</span>
          <span className="truncate">{accountLabel}</span>
          <span className="shrink-0 opacity-40">·</span>
          <span className="shrink-0">{formatDateBR(transaction.transactionDate)}</span>
        </div>
      </div>

      {/* Direita: Badge + Valor */}
      <div className="shrink-0 text-right">
        <Badge variant={config.badge} className="mb-1">{config.label}</Badge>
        <p className={`text-sm font-bold tabular-nums ${config.text}`}>
          {config.prefix}{formatCurrencyPrivacy(transaction.amount)}
        </p>
      </div>
    </article>
  );
}

function DateGroup({ group }) {
  return (
    <div>
      <h4 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {formatDateGroup(group.date)}
      </h4>
      <div className="space-y-2">
        {group.items.map((t) => (
          <TransactionItem key={t.id} transaction={t} />
        ))}
      </div>
    </div>
  );
}

function RecentTransactions({ transactions }) {
  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
          <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">Nenhuma transação encontrada</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">no período selecionado</p>
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <div className="space-y-4">
      {groups.map((group, idx) => (
        <DateGroup key={idx} group={group} />
      ))}
    </div>
  );
}

export default RecentTransactions;
