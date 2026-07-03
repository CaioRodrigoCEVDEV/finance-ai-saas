import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatMonthLabel } from '../../utils/formatters';

function EconomyLabel({ value }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <span>▲</span>
        <span>Economia</span>
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
        <span>▼</span>
        <span>Déficit</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
      <span>Equilíbrio</span>
    </span>
  );
}

function MonthlyFlow({ items }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!items.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Fluxo mensal indisponível para o período selecionado.</p>;
  }

  const maxValue = Math.max(
    ...items.flatMap((item) => [Number(item.income || 0), Number(item.expense || 0), Math.abs(Number(item.economy || 0))]),
    1
  );

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const economy = Number(item.economy || 0);

        return (
          <article key={item.month} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                {formatMonthLabel(item.month)}
              </h3>
              <p className={`mt-1 text-sm font-semibold ${economy > 0 ? 'text-emerald-600 dark:text-emerald-400' : economy < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <EconomyLabel value={economy} />: {formatCurrencyPrivacy(economy)}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Receitas', value: item.income, barTone: 'bg-emerald-500', textTone: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Despesas', value: item.expense, barTone: 'bg-rose-500', textTone: 'text-rose-600 dark:text-rose-400' },
                { label: 'Saldo', value: Math.abs(economy), barTone: economy > 0 ? 'bg-emerald-500' : economy < 0 ? 'bg-rose-500' : 'bg-slate-400 dark:bg-slate-500', textTone: economy > 0 ? 'text-emerald-600 dark:text-emerald-400' : economy < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400' }
              ].map((entry) => (
                <div key={entry.label}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {entry.label}
                    </span>
                    <strong className={`whitespace-nowrap text-sm font-bold ${entry.textTone}`}>
                      {entry.label === 'Saldo' ? formatCurrencyPrivacy(economy) : formatCurrencyPrivacy(entry.value)}
                    </strong>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ease-out ${entry.barTone}`}
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
