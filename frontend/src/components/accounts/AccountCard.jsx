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
    <article className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-sm">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: account.color || '#38bdf8' }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
            {TYPE_LABELS[account.type] || account.type}
          </span>
          <h3 className="mt-4 text-2xl font-semibold text-white">{account.name}</h3>
          <p className="mt-2 text-sm text-slate-400">{account.bankName || 'Instituicao nao informada'}</p>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${account.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
          {account.isActive ? 'Ativa' : 'Inativa'}
        </span>
      </div>

      <div className="mt-8 grid gap-4 rounded-3xl border border-white/5 bg-black/20 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Saldo atual</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatCurrencyBRL(account.currentBalance)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Saldo inicial</p>
          <p className="mt-2 text-lg font-medium text-slate-200">{formatCurrencyBRL(account.initialBalance)}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-400">
        <div>
          <p>Moeda: <span className="font-medium text-slate-200">{account.currency}</span></p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="rounded-2xl border border-slate-700 px-4 py-2 font-medium text-white transition hover:border-sky-400 hover:text-sky-300"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(account)}
            className="rounded-2xl border border-rose-500/40 px-4 py-2 font-medium text-rose-200 transition hover:border-rose-400 hover:text-white"
          >
            Excluir
          </button>
        </div>
      </div>
    </article>
  );
}

export default AccountCard;
