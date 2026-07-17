import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatDateBR } from '../../utils/formatters';

function RecentTransactions({ transactions }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
          <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhuma transação encontrada</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">no período selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => {
        const isExpense = transaction.type === 'EXPENSE';
        const typeLabel = isExpense ? 'Despesa' : 'Receita';
        const accountLabel = transaction.accountName || transaction.creditCardName || 'Sem conta';

        return (
          <article
            key={transaction.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{transaction.description}</h3>
                <Badge variant={isExpense ? 'danger' : 'success'}>{typeLabel}</Badge>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {transaction.categoryName} • {accountLabel} • {formatDateBR(transaction.transactionDate)}
              </p>
            </div>

            <p className={`shrink-0 text-base font-semibold ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isExpense ? '-' : '+'}{formatCurrencyPrivacy(transaction.amount)}
            </p>
          </article>
        );
      })}
    </div>
  );
}

export default RecentTransactions;
