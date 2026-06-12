import {
  Briefcase,
  Building2,
  Coins,
  CreditCard,
  Landmark,
  PiggyBank,
  Shield,
  Smartphone,
  TrendingUp,
  Wallet
} from 'lucide-react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrencyBRL } from '../../utils/formatters';

const TYPE_LABELS = {
  CHECKING: 'Conta corrente',
  SAVINGS: 'Poupanca',
  CASH: 'Dinheiro',
  INVESTMENT: 'Investimento',
  WALLET: 'Carteira',
  OTHER: 'Outra'
};

const ICON_MAP = {
  'bank': Building2,
  'wallet': Wallet,
  'piggy-bank': PiggyBank,
  'credit-card': CreditCard,
  'landmark': Landmark,
  'coins': Coins,
  'chart-line': TrendingUp,
  'safe': Shield,
  'smartphone': Smartphone,
  'briefcase': Briefcase
};

function AccountCard({ account, onEdit, onDelete }) {
  const AccountIcon = ICON_MAP[account.icon];

  return (
    <Card className="relative overflow-hidden rounded-[28px] p-6">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: account.color || '#10b981' }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {TYPE_LABELS[account.type] || account.type}
          </span>
          <div className="mt-4 flex items-center gap-2">
            {AccountIcon ? <AccountIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" /> : null}
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{account.name}</h3>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{account.bankName || 'Instituição não informada'}</p>
        </div>

        <Badge variant={account.isActive ? 'success' : 'neutral'}>{account.isActive ? 'Ativa' : 'Inativa'}</Badge>
      </div>

      <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 dark:border-slate-600 dark:bg-slate-800/50">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Saldo atual</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(account.currentBalance)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Saldo inicial</p>
          <p className="mt-2 text-lg font-medium text-slate-700 dark:text-slate-300">{formatCurrencyBRL(account.initialBalance)}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div>
          <p>Moeda: <span className="font-medium text-slate-700 dark:text-slate-300">{account.currency}</span></p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={() => onEdit(account)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(account)} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            Excluir
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default AccountCard;
