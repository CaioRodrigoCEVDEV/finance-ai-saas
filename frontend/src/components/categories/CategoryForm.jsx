import { useEffect, useState } from 'react';

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
  color: '#8b5cf6',
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
    color: category.color || '#8b5cf6',
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
    <section className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-violet-300/80">{category ? 'Editar categoria' : 'Nova categoria'}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {category ? 'Atualize a categoria personalizada' : 'Cadastre uma nova categoria para este tenant'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          Fechar
        </button>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-200">Nome</span>
            <input name="name" value={formValues.name} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Tipo</span>
            <select name="type" value={formValues.type} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-violet-400">
              {CATEGORY_TYPES.map((typeOption) => (
                <option key={typeOption.value} value={typeOption.value}>{typeOption.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Categoria pai</span>
            <select name="parentId" value={formValues.parentId} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-violet-400">
              <option value="">Sem categoria pai</option>
              {parentOptions.map((parentOption) => (
                <option key={parentOption.id} value={parentOption.id}>{parentOption.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Cor</span>
            <input name="color" value={formValues.color} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Icone</span>
            <input name="icon" value={formValues.icon} onChange={handleChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
        </div>

        {category ? (
          <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
            <input name="isActive" type="checkbox" checked={formValues.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 bg-slate-900" />
            Categoria ativa
          </label>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading} className="rounded-2xl bg-violet-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Salvando...' : category ? 'Salvar alteracoes' : 'Criar categoria'}
          </button>
          <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-700 px-5 py-3 font-medium text-white transition hover:border-slate-500">
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default CategoryForm;
