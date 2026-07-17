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

function TransactionMobileCard({ transaction, loading, onEdit, onDelete, onConfirm }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const holderName = transaction.creditCard?.name || transaction.account?.name || 'Sem vinculacao';
  const isTransferOut = transaction.type === 'TRANSFER' && transaction.amount < 0;
  const isTransferIn = transaction.type === 'TRANSFER' && transaction.amount > 0;
  const isNegativeValue = ['EXPENSE', 'INVESTMENT'].includes(transaction.type) || isTransferOut;
  const amountColor = isTransferIn ? 'text-emerald-600' : isNegativeValue ? 'text-rose-600' : 'text-emerald-600';
  const amountPrefix = isTransferIn ? '+' : isNegativeValue ? '-' : '+';

  return (
    <Card className="rounded-[28px] p-5 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{formatDateBR(transaction.transactionDate)}</p>
        <p className={`shrink-0 whitespace-nowrap text-right text-base font-semibold ${amountColor}`}>
          {amountPrefix}{formatCurrencyPrivacy(transaction.amount)}
        </p>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">{transaction.description}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">{transaction.category?.name || 'Sem categoria'} • {holderName}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={getTypeVariant(transaction.type)}>{formatTransactionType(transaction.type)}</Badge>
        <Badge variant={getStatusVariant(transaction.status)}>{formatTransactionStatus(transaction.status)}</Badge>
      </div>

      {transaction.notes ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{transaction.notes}</p> : null}

      <div className="mt-5 flex flex-col gap-3">
        {transaction.status === 'PENDING' ? (
          <Button variant="secondary" size="sm" className="w-full min-h-[44px] text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => onConfirm(transaction)} disabled={loading}>
            <CheckCircle className="h-4 w-4" />
            Confirmar
          </Button>
        ) : null}
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" className="flex-1 min-h-[44px]" onClick={() => onEdit(transaction)} disabled={loading}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 min-h-[44px] text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => onDelete(transaction)} disabled={loading}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default TransactionMobileCard;
