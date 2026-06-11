import { Pencil, Trash2 } from 'lucide-react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

import {
  formatCurrencyBRL,
  formatDateBR,
  formatTransactionStatus,
  formatTransactionType
} from '../../utils/formatters';

function getTypeVariant(type) {
  if (type === 'INCOME') {
    return 'success';
  }

  if (type === 'EXPENSE') {
    return 'danger';
  }

  if (type === 'INVESTMENT') {
    return 'info';
  }

  return 'warning';
}

function getStatusVariant(status) {
  if (status === 'CONFIRMED') {
    return 'success';
  }

  if (status === 'CANCELED') {
    return 'danger';
  }

  return 'warning';
}

function TransactionTable({ transactions, pagination, loading, onEdit, onDelete, onPageChange }) {
  return (
    <Card className="hidden overflow-hidden rounded-[28px] p-0 lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descricao</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Conta/Cartao</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-right">Acoes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-800">
            {transactions.map((transaction) => {
              const holderName = transaction.creditCard?.name || transaction.account?.name || 'Sem vinculacao';
              const isNegativeValue = ['EXPENSE', 'INVESTMENT'].includes(transaction.type);
              const amountColor = isNegativeValue ? 'text-rose-600' : transaction.type === 'TRANSFER' ? 'text-slate-700 dark:text-slate-300' : 'text-emerald-600';
              const amountPrefix = transaction.type === 'TRANSFER' ? '' : isNegativeValue ? '-' : '+';

              return (
                <tr key={transaction.id} className="align-top text-sm text-slate-600 dark:text-slate-400">
                  <td className="px-6 py-5 font-medium text-slate-900 dark:text-slate-100">{formatDateBR(transaction.transactionDate)}</td>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{transaction.description}</p>
                    {transaction.notes ? <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">{transaction.notes}</p> : null}
                  </td>
                  <td className="px-6 py-5">{transaction.category?.name || 'Sem categoria'}</td>
                  <td className="px-6 py-5">{holderName}</td>
                  <td className="px-6 py-5"><Badge variant={getTypeVariant(transaction.type)}>{formatTransactionType(transaction.type)}</Badge></td>
                  <td className="px-6 py-5"><Badge variant={getStatusVariant(transaction.status)}>{formatTransactionStatus(transaction.status)}</Badge></td>
                  <td className={`px-6 py-5 text-right font-semibold ${amountColor}`}>
                    {amountPrefix}{formatCurrencyBRL(transaction.amount)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onEdit(transaction)} disabled={loading}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => onDelete(transaction)} disabled={loading}>
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <span>Pagina {pagination.page} de {pagination.totalPages} • {pagination.total} registros</span>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => onPageChange(pagination.page - 1)} disabled={loading || pagination.page <= 1}>Anterior</Button>
          <Button variant="secondary" size="sm" onClick={() => onPageChange(pagination.page + 1)} disabled={loading || pagination.page >= pagination.totalPages}>Proxima</Button>
        </div>
      </div>
    </Card>
  );
}

export default TransactionTable;
