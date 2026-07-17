import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatMonthLabel } from '../../utils/formatters';

function EconomyLabel({ value }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <span>↑</span>
        <span>Economia</span>
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
        <span>↓</span>
        <span>Déficit</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
      <span>→</span>
      <span>Equilíbrio</span>
    </span>
  );
}

function MonthlyFlow({ items }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700/50">
          <svg className="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhuma movimentação encontrada</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">neste período</p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...items.flatMap((item) => [Number(item.income || 0), Number(item.expense || 0), Math.abs(Number(item.economy || 0))]),
    1
  );

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const economy = Number(item.economy || 0);

        return (
          <article key={item.month} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                {formatMonthLabel(item.month)}
              </h3>
              <p className={`mt-1 text-sm font-semibold ${economy > 0 ? 'text-emerald-600 dark:text-emerald-400' : economy < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <EconomyLabel value={economy} />: {formatCurrencyPrivacy(economy)}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Receitas', value: item.income, color: 'emerald', textTone: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Despesas', value: item.expense, color: 'rose', textTone: 'text-rose-600 dark:text-rose-400' },
                { label: 'Saldo', value: Math.abs(economy), color: economy > 0 ? 'emerald' : economy < 0 ? 'rose' : 'slate', textTone: economy > 0 ? 'text-emerald-600 dark:text-emerald-400' : economy < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400' }
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
                  <div className="mt-1.5">
                    <ProgressBar
                      value={(Number(entry.value || 0) / maxValue) * 100}
                      color={entry.color}
                      height="h-1.5"
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
