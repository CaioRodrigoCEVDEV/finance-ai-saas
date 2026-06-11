import { useEffect, useState } from 'react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const CATEGORY_TYPES = [
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'INVESTMENT', label: 'Investimento' }
];

const initialFormValues = {
  name: '',
  type: 'EXPENSE',
  parentId: '',
  color: '#10b981',
  icon: 'tag',
  isActive: true
};

function buildFormValues(category) {
  if (!category) {
    return initialFormValues;
  }

  return {
    name: category.name || '',
    type: category.type || 'EXPENSE',
    parentId: category.parentId || '',
    color: category.color || '#10b981',
    icon: category.icon || 'tag',
    isActive: category.isActive ?? true
  };
}

function CategoryForm({ category, categories, loading, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormValues(buildFormValues(category));
    setError('');
  }, [category]);

  const parentOptions = categories.filter((item) => item.type === formValues.type && item.id !== category?.id);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'type' ? { parentId: '' } : {})
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formValues.name.trim().length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      type: formValues.type,
      parentId: formValues.parentId || null,
      color: formValues.color.trim() || null,
      icon: formValues.icon.trim() || null
    };

    if (category) {
      payload.isActive = formValues.isActive;
    }

    setError('');
    await onSubmit(payload);
  }

  return (
    <section>
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-600">{category ? 'Editar categoria' : 'Nova categoria'}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {category ? 'Atualize a categoria personalizada' : 'Cadastre uma nova categoria para este tenant'}
        </h2>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Nome" name="name" value={formValues.name} onChange={handleChange} />
          </div>

          <Select label="Tipo" name="type" value={formValues.type} onChange={handleChange}>
              {CATEGORY_TYPES.map((typeOption) => (
                <option key={typeOption.value} value={typeOption.value}>{typeOption.label}</option>
              ))}
          </Select>

          <Select label="Categoria pai" name="parentId" value={formValues.parentId} onChange={handleChange}>
              <option value="">Sem categoria pai</option>
              {parentOptions.map((parentOption) => (
                <option key={parentOption.id} value={parentOption.id}>{parentOption.name}</option>
              ))}
          </Select>

          <Input label="Cor" name="color" value={formValues.color} onChange={handleChange} />
          <Input label="Icone" name="icon" value={formValues.icon} onChange={handleChange} />
        </div>

        {category ? (
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
            <input name="isActive" type="checkbox" checked={formValues.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
            Categoria ativa
          </label>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : category ? 'Salvar alteracoes' : 'Criar categoria'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </section>
  );
}

export default CategoryForm;
