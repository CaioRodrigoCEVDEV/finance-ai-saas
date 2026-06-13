import { useEffect, useState } from 'react';

import Input from '../ui/Input';
import Select from '../ui/Select';

const CATEGORY_TYPES = [
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'TRANSFER', label: 'Transferência' },
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

function CategoryForm({ category, categories, onSubmit, formId = 'category-form' }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [error, setError] = useState('');
  const fieldClassName = 'h-11 py-0 text-sm';

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
      <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2">
            <Input label="Nome" name="name" value={formValues.name} onChange={handleChange} className={fieldClassName} />
          </div>

          <Select label="Tipo" name="type" value={formValues.type} onChange={handleChange} className={fieldClassName}>
              {CATEGORY_TYPES.map((typeOption) => (
                <option key={typeOption.value} value={typeOption.value}>{typeOption.label}</option>
              ))}
          </Select>

          <Select label="Categoria pai" name="parentId" value={formValues.parentId} onChange={handleChange} className={fieldClassName}>
              <option value="">Sem categoria pai</option>
              {parentOptions.map((parentOption) => (
                <option key={parentOption.id} value={parentOption.id}>{parentOption.name}</option>
              ))}
          </Select>

          <Input label="Cor" name="color" value={formValues.color} onChange={handleChange} className={fieldClassName} />
          <Input label="Ícone" name="icon" value={formValues.icon} onChange={handleChange} className={fieldClassName} />
        </div>

        {category ? (
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:border-slate-600/70 dark:bg-slate-700/30 dark:text-slate-300">
            <input name="isActive" type="checkbox" checked={formValues.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600 dark:border-slate-500 dark:bg-slate-700" />
            Categoria ativa
          </label>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

      </form>
    </section>
  );
}

export default CategoryForm;
