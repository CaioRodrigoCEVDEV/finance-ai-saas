import Badge from '../ui/Badge';

import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

function RecentTransactions({ transactions }) {
  if (!transactions.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma transação recente encontrada.</p>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isExpense = transaction.type === 'EXPENSE';
        const typeLabel = isExpense ? 'Despesa' : 'Receita';
        const accountLabel = transaction.accountName || transaction.creditCardName || 'Sem conta';

        return (
            <article
              key={transaction.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{transaction.description}</h3>
                  <Badge variant={isExpense ? 'danger' : 'success'}>{typeLabel}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {transaction.categoryName} • {accountLabel} • {formatDateBR(transaction.transactionDate)}
                </p>
              </div>

              <p className={`text-base font-semibold ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isExpense ? '-' : '+'}{formatCurrencyBRL(transaction.amount)}
              </p>
            </article>
        );
      })}
    </div>
  );
}

export default RecentTransactions;
