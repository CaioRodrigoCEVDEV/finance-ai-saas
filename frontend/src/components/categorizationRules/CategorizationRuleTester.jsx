import { useState } from 'react';
import { Search } from 'lucide-react';

import { testCategorizationRule } from '../../services/categorizationRuleService';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

function CategorizationRuleTester() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleTest() {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await testCategorizationRule(description.trim());
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao testar regra.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[28px] p-6">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Testar regra</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Digite uma descricao de transacao para simular qual regra seria aplicada.
      </p>

      <div className="mt-4 flex items-start gap-3">
        <div className="flex-1">
          <Input
            placeholder="Ex: IFOOD SAO PAULO 123"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTest();
            }}
          />
        </div>
        <Button onClick={handleTest} disabled={loading || !description.trim()}>
          <Search className="h-4 w-4" />
          Testar
        </Button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-rose-600">{error}</p>
      ) : null}

      {result && !error ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/50">
          {result.matched ? (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                Regra encontrada: {result.rule.name}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Comparacao: {result.rule.matchType} "{result.rule.matchText}"
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Categoria sugerida: {result.category?.name || '-'} ({result.category?.type || '-'})
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nenhuma regra ativa corresponde a essa descricao.
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
}

export default CategorizationRuleTester;
