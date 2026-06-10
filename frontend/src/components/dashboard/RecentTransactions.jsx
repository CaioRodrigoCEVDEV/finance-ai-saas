import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

function RecentTransactions({ transactions }) {
  if (!transactions.length) {
    return <p className="text-sm text-slate-400">Nenhuma transacao recente encontrada.</p>;
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
            className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-sm font-semibold text-white">{transaction.description}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isExpense ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                  {typeLabel}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {transaction.categoryName} • {accountLabel} • {formatDateBR(transaction.transactionDate)}
              </p>
            </div>

            <p className={`text-base font-semibold ${isExpense ? 'text-rose-300' : 'text-emerald-300'}`}>
              {isExpense ? '-' : '+'}{formatCurrencyBRL(transaction.amount)}
            </p>
          </article>
        );
      })}
    </div>
  );
}

export default RecentTransactions;
