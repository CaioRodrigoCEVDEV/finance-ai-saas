import { CheckCircle, Pencil, Trash2 } from 'lucide-react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';

import {
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

function TransactionTable({ transactions, pagination, loading, onEdit, onDelete, onPageChange, onConfirm }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  return (
    <Card className="hidden overflow-hidden p-0 min-[1521px]:block">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <th className="w-[95px] px-3 py-3 whitespace-nowrap">Data</th>
              <th className="px-3 py-3">Descrição</th>
              <th className="w-[120px] px-3 py-3">Categoria</th>
              <th className="w-[130px] px-3 py-3">Conta/Cartão</th>
              <th className="w-[85px] px-3 py-3">Tipo</th>
              <th className="w-[90px] px-3 py-3">Status</th>
              <th className="w-[105px] px-3 py-3 text-right whitespace-nowrap">Valor</th>
              <th className="w-[140px] px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-800">
            {transactions.map((transaction) => {
              const holderName = transaction.creditCard?.name || transaction.account?.name || 'Sem vinculo';
              const isTransferOut = transaction.type === 'TRANSFER' && transaction.amount < 0;
              const isTransferIn = transaction.type === 'TRANSFER' && transaction.amount > 0;
              const isNegativeValue = ['EXPENSE', 'INVESTMENT'].includes(transaction.type) || isTransferOut;
              const amountColor = isTransferIn ? 'text-emerald-600' : isNegativeValue ? 'text-rose-600' : 'text-emerald-600';
              const amountPrefix = isTransferIn ? '+' : isNegativeValue ? '-' : '+';

              return (
                <tr key={transaction.id} className="align-top text-sm text-slate-600 dark:text-slate-400">
                  <td className="px-3 py-3 font-medium whitespace-nowrap text-slate-900 dark:text-slate-100">{formatDateBR(transaction.transactionDate)}</td>
                  <td className="px-3 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 break-words">{transaction.description}</p>
                      {transaction.notes ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 break-words">{transaction.notes}</p> : null}
                    </div>
                  </td>
                  <td className="px-3 py-3"><span className="block max-w-[120px] truncate">{transaction.category?.name || 'Sem categoria'}</span></td>
                  <td className="px-3 py-3"><span className="block max-w-[130px] truncate">{holderName}</span></td>
                  <td className="px-3 py-3 whitespace-nowrap"><Badge variant={getTypeVariant(transaction.type)}>{formatTransactionType(transaction.type)}</Badge></td>
                  <td className="px-3 py-3 whitespace-nowrap"><Badge variant={getStatusVariant(transaction.status)}>{formatTransactionStatus(transaction.status)}</Badge></td>
                  <td className={`px-3 py-3 text-right font-semibold whitespace-nowrap ${amountColor}`}>
                    {amountPrefix}{formatCurrencyPrivacy(transaction.amount)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      {transaction.status === 'PENDING' ? (
                        <Button variant="secondary" className="h-8 px-2.5 text-xs gap-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => onConfirm(transaction)} disabled={loading}>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Confirmar
                        </Button>
                      ) : null}
                      <Button variant="secondary" className="h-8 px-2.5 text-xs gap-1.5" onClick={() => onEdit(transaction)} disabled={loading}>
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button variant="ghost" className="h-8 px-2.5 text-xs gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => onDelete(transaction)} disabled={loading}>
                        <Trash2 className="h-3.5 w-3.5" />
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

      <div className="flex flex-col gap-3 border-t border-border-soft px-4 py-3 text-sm text-content-secondary sm:flex-row sm:items-center sm:justify-between">
        <span>Página {pagination.page} de {pagination.totalPages} • {pagination.total} registros</span>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => onPageChange(pagination.page - 1)} disabled={loading || pagination.page <= 1}>Anterior</Button>
          <Button variant="secondary" size="sm" onClick={() => onPageChange(pagination.page + 1)} disabled={loading || pagination.page >= pagination.totalPages}>Próxima</Button>
        </div>
      </div>
    </Card>
  );
}

export default TransactionTable;
