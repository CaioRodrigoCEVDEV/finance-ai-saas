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

function AccountCard({ account, onEdit, onDelete }) {
  return (
    <Card className="relative overflow-hidden rounded-[28px] p-6">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: account.color || '#10b981' }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-600">
            {TYPE_LABELS[account.type] || account.type}
          </span>
          <h3 className="mt-4 text-2xl font-semibold text-slate-900">{account.name}</h3>
          <p className="mt-2 text-sm text-slate-500">{account.bankName || 'Instituicao nao informada'}</p>
        </div>

        <Badge variant={account.isActive ? 'success' : 'neutral'}>{account.isActive ? 'Ativa' : 'Inativa'}</Badge>
      </div>

      <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Saldo atual</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrencyBRL(account.currentBalance)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Saldo inicial</p>
          <p className="mt-2 text-lg font-medium text-slate-700">{formatCurrencyBRL(account.initialBalance)}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-500">
        <div>
          <p>Moeda: <span className="font-medium text-slate-700">{account.currency}</span></p>
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
