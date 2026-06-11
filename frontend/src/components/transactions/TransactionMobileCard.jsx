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

function TransactionMobileCard({ transaction, loading, onEdit, onDelete }) {
  const holderName = transaction.creditCard?.name || transaction.account?.name || 'Sem vinculacao';
  const isNegativeValue = ['EXPENSE', 'INVESTMENT'].includes(transaction.type);
  const amountColor = isNegativeValue ? 'text-rose-600' : transaction.type === 'TRANSFER' ? 'text-slate-700' : 'text-emerald-600';
  const amountPrefix = transaction.type === 'TRANSFER' ? '' : isNegativeValue ? '-' : '+';

  return (
    <Card className="rounded-[28px] p-5 lg:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
           <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{formatDateBR(transaction.transactionDate)}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{transaction.description}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{transaction.category?.name || 'Sem categoria'} • {holderName}</p>
        </div>
        <p className={`text-base font-semibold ${amountColor}`}>
          {amountPrefix}{formatCurrencyBRL(transaction.amount)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={getTypeVariant(transaction.type)}>{formatTransactionType(transaction.type)}</Badge>
        <Badge variant={getStatusVariant(transaction.status)}>{formatTransactionStatus(transaction.status)}</Badge>
      </div>

      {transaction.notes ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{transaction.notes}</p> : null}

      <div className="mt-5 flex gap-3">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onEdit(transaction)} disabled={loading}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => onDelete(transaction)} disabled={loading}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>
    </Card>
  );
}

export default TransactionMobileCard;
