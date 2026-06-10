import { useEffect, useState } from 'react';

import { getCategories } from '../../services/categoryService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const matchTypeOptions = [
  { value: 'CONTAINS', label: 'Contem' },
  { value: 'STARTS_WITH', label: 'Comeca com' },
  { value: 'ENDS_WITH', label: 'Termina com' },
  { value: 'EQUALS', label: 'Igual a' },
  { value: 'REGEX', label: 'Expressao regular (Regex)' }
];

function CategorizationRuleForm({ rule, loading, onCancel, onSubmit }) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [name, setName] = useState(rule?.name || '');
  const [matchText, setMatchText] = useState(rule?.matchText || '');
  const [matchType, setMatchType] = useState(rule?.matchType || 'CONTAINS');
  const [categoryId, setCategoryId] = useState(rule?.category?.id || '');
  const [priority, setPriority] = useState(rule?.priority ?? 1);
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);

  useEffect(() => {
    async function load() {
      try {
        setCategoriesLoading(true);
        const data = await getCategories({ includeInactive: true });
        setCategories(data);
      } catch {
        setFormError('Nao foi possivel carregar as categorias.');
      } finally {
        setCategoriesLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (rule) {
      setName(rule.name || '');
      setMatchText(rule.matchText || '');
      setMatchType(rule.matchType || 'CONTAINS');
      setCategoryId(rule.category?.id || '');
      setPriority(rule.priority ?? 1);
      setIsActive(rule.isActive ?? true);
    } else {
      setName('');
      setMatchText('');
      setMatchType('CONTAINS');
      setCategoryId('');
      setPriority(1);
      setIsActive(true);
    }
  }, [rule]);

  function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Nome e obrigatorio.');
      return;
    }
    if (!matchText.trim() || matchText.trim().length < 2) {
      setFormError('Texto procurado deve ter no minimo 2 caracteres.');
      return;
    }
    if (!categoryId) {
      setFormError('Selecione uma categoria.');
      return;
    }

    const payload = {
      name: name.trim(),
      matchText: matchText.trim(),
      matchType,
      categoryId,
      priority: Number(priority),
      isActive
    };

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError ? (
        <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
          {formError}
        </div>
      ) : null}

      <Input
        label="Nome da regra"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Ifood para Alimentacao"
        disabled={loading || categoriesLoading}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Texto procurado"
          value={matchText}
          onChange={(e) => setMatchText(e.target.value)}
          placeholder="Ex: IFOOD"
          disabled={loading || categoriesLoading}
        />

        <Select
          label="Tipo de comparacao"
          value={matchType}
          onChange={(e) => setMatchType(e.target.value)}
          disabled={loading || categoriesLoading}
        >
          {matchTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <Select
        label="Categoria destino"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        disabled={loading || categoriesLoading}
      >
        <option value="">Selecione uma categoria</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name} ({cat.type})
          </option>
        ))}
      </Select>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Prioridade"
          type="number"
          min={0}
          max={9999}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={loading || categoriesLoading}
        />

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={loading || categoriesLoading}
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
            Regra ativa
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || categoriesLoading}>
          {loading ? 'Salvando...' : rule ? 'Salvar alteracoes' : 'Criar regra'}
        </Button>
      </div>
    </form>
  );
}

export default CategorizationRuleForm;
