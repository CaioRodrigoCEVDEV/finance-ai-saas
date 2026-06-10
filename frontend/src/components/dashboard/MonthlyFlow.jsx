import { formatCurrencyBRL } from '../../utils/formatters';

function formatMonthLabel(monthKey) {
  const [year, month] = String(monthKey).split('-');

  if (!year || !month) {
    return monthKey;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit'
  }).format(new Date(Number(year), Number(month) - 1, 1));
}

function MonthlyFlow({ items }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">Fluxo mensal indisponivel no momento.</p>;
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
          <article key={item.month} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {formatMonthLabel(item.month)}
                </h3>
                <p className={`mt-2 text-sm font-medium ${economyPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Economia: {formatCurrencyBRL(item.economy)}
                </p>
              </div>

              <div className="grid flex-1 gap-3 lg:max-w-2xl lg:grid-cols-3">
                {[
                  { label: 'Receitas', value: item.income, tone: 'bg-emerald-500' },
                  { label: 'Despesas', value: item.expense, tone: 'bg-rose-500' },
                  { label: 'Saldo', value: Math.abs(Number(item.economy || 0)), tone: economyPositive ? 'bg-sky-500' : 'bg-amber-500' }
                ].map((entry) => (
                  <div key={entry.label}>
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{entry.label}</span>
                      <span>{formatCurrencyBRL(entry.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full ${entry.tone}`}
                        style={{ width: `${Math.max((Number(entry.value || 0) / maxValue) * 100, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default MonthlyFlow;
