import { CalendarDays, Eye, EyeOff, Landmark, PiggyBank, Smartphone, Wallet } from 'lucide-react';

import { usePrivacy } from '../../contexts/PrivacyContext';
import Card from '../ui/Card';

const accountIcons = {
  bank: Landmark,
  'piggy-bank': PiggyBank,
  smartphone: Smartphone,
  wallet: Wallet
};

function colorWithAlpha(color, alpha) {
  return /^#[0-9a-f]{6}$/i.test(color || '') ? `${color}${alpha}` : undefined;
}

function AccountsBalanceCard({ accounts, todayExpense, totalBalance = 0 }) {
  const { formatCurrencyPrivacy, hideValues, toggleHideValues } = usePrivacy();
  const accountsAvailable = Array.isArray(accounts);

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-4 pb-4 pt-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-[-0.02em] text-content-primary">Saldo de contas</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleHideValues}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-content-secondary transition hover:bg-surface-hover hover:text-content-primary"
              aria-label={hideValues ? 'Exibir valores' : 'Ocultar valores'}
              title={hideValues ? 'Exibir valores' : 'Ocultar valores'}
            >
              {hideValues ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
            <span className="flex h-9 items-center gap-2 rounded-full bg-surface-secondary px-3 text-xs font-medium text-content-secondary" title="Saldos atuais">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Atual</span>
            </span>
          </div>
        </div>

        <div className="mt-5 border-l-4 border-primary pl-3">
          <p className="text-3xl font-bold tracking-[-0.04em] text-content-primary sm:text-4xl">
            {formatCurrencyPrivacy(totalBalance)}
          </p>
        </div>

        <div className="scrollbar-none mt-4 flex snap-x gap-2 overflow-x-auto pb-1">
          {accountsAvailable && accounts.length > 0 ? accounts.map((account) => {
            const Icon = accountIcons[account.icon] || Wallet;
            const color = account.color || '#10b981';

            return (
              <div
                key={account.id}
                className={`flex min-w-[176px] snap-start items-center gap-2.5 rounded-xl border border-border-soft bg-surface-secondary px-3 py-2 ${account.considerInAvailableBalance === false ? 'opacity-65' : ''}`}
                title={account.considerInAvailableBalance === false ? 'Esta conta não compõe o saldo total' : account.name}
                style={{
                  backgroundColor: colorWithAlpha(color, '0D'),
                  borderColor: colorWithAlpha(color, '35')
                }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: color }}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs text-content-secondary">{account.name}</span>
                  <span className="mt-0.5 block truncate text-sm font-bold text-content-primary">
                    {formatCurrencyPrivacy(account.currentBalance)}
                  </span>
                  {account.considerInAvailableBalance === false ? <span className="block text-[9px] text-content-muted">Fora do total</span> : null}
                </span>
              </div>
            );
          }) : accountsAvailable ? (
            <div className="flex min-h-14 w-full items-center justify-center rounded-xl border border-dashed border-border-ui bg-surface-secondary px-4 text-sm text-content-muted">
              Nenhuma conta cadastrada
            </div>
          ) : (
            <div className="flex min-h-14 w-full items-center justify-center rounded-xl border border-dashed border-border-ui bg-surface-secondary px-4 text-sm text-content-muted">
              Saldos por conta indisponíveis
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border-soft px-4 py-3 sm:px-5">
        <span className="text-sm font-semibold text-content-primary">Gastos confirmados hoje</span>
        <span className="text-sm font-bold text-danger">
          {todayExpense == null ? '--' : formatCurrencyPrivacy(todayExpense)}
        </span>
      </div>
    </Card>
  );
}

export default AccountsBalanceCard;
