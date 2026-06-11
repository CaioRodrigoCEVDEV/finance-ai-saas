import { useState } from 'react';
import { Play } from 'lucide-react';

import { applyCategorizationRules } from '../../services/categorizationRuleService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

function ApplyRulesModal({ isOpen, onClose }) {
  const [onlyWithoutCategory, setOnlyWithoutCategory] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleApply() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        onlyWithoutCategory,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      const data = await applyCategorizationRules(payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao aplicar regras.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setResult(null);
    setError('');
    setOnlyWithoutCategory(true);
    setStartDate('');
    setEndDate('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} title="Aplicar regras em transacoes" onClose={handleClose}>
      <div className="space-y-5">
        {result ? (
          <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
            <p className="font-semibold">{result.message}</p>
            <p className="mt-1">Processadas: {result.processed}</p>
            <p>Atualizadas: {result.updated}</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <input
            id="onlyWithoutCategory"
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-500 dark:bg-slate-700"
            checked={onlyWithoutCategory}
            onChange={(e) => setOnlyWithoutCategory(e.target.checked)}
            disabled={loading || !!result}
          />
          <label htmlFor="onlyWithoutCategory" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Aplicar apenas em transacoes sem categoria
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Data inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading || !!result}
          />
          <Input
            label="Data final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading || !!result}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={handleClose} disabled={loading}>
            {result ? 'Fechar' : 'Cancelar'}
          </Button>
          {!result ? (
            <Button onClick={handleApply} disabled={loading}>
              <Play className="h-4 w-4" />
              {loading ? 'Aplicando...' : 'Aplicar regras'}
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

export default ApplyRulesModal;
