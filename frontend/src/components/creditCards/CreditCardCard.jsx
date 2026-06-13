import { CalendarDays, CreditCard as CreditCardIcon, Pencil, Trash2 } from 'lucide-react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatDateBR, formatPercentage } from '../../utils/formatters';

function getBrandLabel(brand) {
  const labels = {
    VISA: 'Visa',
    MASTERCARD: 'Mastercard',
    ELO: 'Elo',
    AMEX: 'Amex',
    HIPERCARD: 'Hipercard',
    OTHER: 'Outra'
  };

  return labels[brand] || 'Sem bandeira';
}

function CreditCardCard({ creditCard, onEdit, onDelete, loading }) {
  const { formatCurrencyPrivacy } = usePrivacy();
  const usagePercentage = creditCard.limitAmount > 0
    ? Math.min((creditCard.currentInvoiceAmount / creditCard.limitAmount) * 100, 100)
    : 0;

  return (
    <Card
      className="relative overflow-hidden rounded-[32px] border-0 p-0 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
      style={{ background: `linear-gradient(135deg, ${creditCard.color || '#7c3aed'} 0%, #0f172a 88%)` }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_35%)]" />
      <div className="relative space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">Cartão de crédito</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{creditCard.name}</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={() => onEdit(creditCard)} disabled={loading}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={() => onDelete(creditCard)} disabled={loading}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-white/75">
          <span className="inline-flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            {getBrandLabel(creditCard.brand)}
          </span>
          <Badge variant={creditCard.isActive ? 'success' : 'neutral'} className="bg-white/15 text-white ring-white/20">
            {creditCard.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Conta vinculada</p>
            <p className="mt-2 text-sm font-medium text-white">{creditCard.account?.name || 'Nao vinculada'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Criado em</p>
            <p className="mt-2 text-sm font-medium text-white">{formatDateBR(creditCard.createdAt)}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Limite total</p>
            <p className="mt-2 text-lg font-semibold">{formatCurrencyPrivacy(creditCard.limitAmount)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Usado no mes</p>
            <p className="mt-2 text-lg font-semibold">{formatCurrencyPrivacy(creditCard.currentInvoiceAmount)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Disponivel</p>
            <p className="mt-2 text-lg font-semibold">{formatCurrencyPrivacy(creditCard.availableLimit)}</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
            <span>Uso do limite</span>
            <span>{formatPercentage(usagePercentage)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/15">
            <div className="h-2 rounded-full bg-white" style={{ width: `${usagePercentage}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
          <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />Fechamento dia {creditCard.closingDay}</span>
          <span>Vencimento dia {creditCard.dueDay}</span>
        </div>
      </div>
    </Card>
  );
}

export default CreditCardCard;
