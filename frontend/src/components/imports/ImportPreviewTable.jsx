import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';

function ImportPreviewTable({
  preview,
  categories,
  onChange,
  onRemove,
  onConfirm,
  loading
}) {
  const [edited, setEdited] = useState({});

  const transactions = preview.transactions || [];

  function handleFieldChange(index, field, value) {
    const next = [...transactions];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function handleRemove(index) {
    onRemove(index);
  }

  const validTransactions = transactions.filter((t) => t.isValid !== false);
  const invalidTransactions = transactions.filter((t) => t.isValid === false);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pre-visualizacao</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {preview.fileName} — {preview.totalRows} linha(s) — {preview.validRows} valida(s) — {preview.invalidRows} invalida(s)
            </p>
          </div>
          <Button
            onClick={onConfirm}
            disabled={validTransactions.length === 0 || loading}
          >
            {loading ? 'Confirmando...' : 'Confirmar importação'}
          </Button>
        </div>

        {invalidTransactions.length > 0 && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {invalidTransactions.length} linha(s) invalida(s) detectada(s)
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="pb-3 pr-4 font-medium">Data</th>
                <th className="pb-3 pr-4 font-medium">Descrição</th>
                <th className="pb-3 pr-4 font-medium">Valor</th>
                <th className="pb-3 pr-4 font-medium">Tipo</th>
                <th className="pb-3 pr-4 font-medium">Categoria</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {transactions.map((transaction, index) => (
                <tr
                  key={index}
                  className={transaction.isValid === false ? 'bg-rose-50/50 dark:bg-rose-900/10' : ''}
                >
                  <td className="py-3 pr-4">
                    <input
                      type="date"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                      value={transaction.transactionDate || ''}
                      onChange={(e) => handleFieldChange(index, 'transactionDate', e.target.value)}
                    />
                    {transaction.isValid === false && transaction.errors?.length > 0 && (
                      <div className="mt-1 text-xs text-rose-600">
                        {transaction.errors.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                      value={transaction.description || ''}
                      onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                      value={transaction.amount || ''}
                      onChange={(e) => handleFieldChange(index, 'amount', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                      value={transaction.type || 'EXPENSE'}
                      onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                    >
                      <option value="EXPENSE">Despesa</option>
                      <option value="INCOME">Receita</option>
                      <option value="TRANSFER">Transferencia</option>
                      <option value="INVESTMENT">Investimento</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                      value={transaction.categoryId || transaction.suggestedCategoryId || ''}
                      onChange={(e) => handleFieldChange(index, 'categoryId', e.target.value || null)}
                    >
                      <option value="">Selecione</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {transaction.suggestedCategoryName && !transaction.categoryId && (
                      <div className="mt-1 text-xs text-emerald-600">
                        Sugestão: {transaction.suggestedCategoryName}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={transaction.isValid === false ? 'danger' : 'success'}>
                      {transaction.isValid === false ? 'Inválido' : 'Válido'}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="inline-flex items-center rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Nenhuma transação detectada no arquivo.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ImportPreviewTable;
