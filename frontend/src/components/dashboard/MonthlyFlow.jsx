import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatMonthLabel } from '../../utils/formatters';

function MonthlyFlow({ items }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!items.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Fluxo mensal indisponivel no momento.</p>;
  }

  const maxValue = Math.max(
    ...items.flatMap((item) => [Number(item.income || 0), Number(item.expense || 0), Number(item.economy || 0)]),
    1
  );

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const economyPositive = Number(item.economy || 0) >= 0;

        return (
            <article key={item.month} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  {formatMonthLabel(item.month)}
                </h3>
              <p className={`mt-1 text-sm font-semibold ${economyPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                Economia: {formatCurrencyPrivacy(item.economy)}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Receitas', value: item.income, tone: 'bg-emerald-500' },
                { label: 'Despesas', value: item.expense, tone: 'bg-rose-500' },
                { label: 'Saldo', value: Math.abs(Number(item.economy || 0)), tone: economyPositive ? 'bg-sky-500' : 'bg-amber-500' }
              ].map((entry) => (
                <div key={entry.label}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {entry.label}
                    </span>
                    <strong className="whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrencyPrivacy(entry.value)}
                    </strong>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-1.5 rounded-full ${entry.tone}`}
                      style={{ width: `${Math.max((Number(entry.value || 0) / maxValue) * 100, 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default MonthlyFlow;
