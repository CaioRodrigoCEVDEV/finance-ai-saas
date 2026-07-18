import { useEffect, useRef, useState } from 'react';

import Input from '../ui/Input';
import Select from '../ui/Select';
import TaskChecklist from './TaskChecklist';

const initialFormValues = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: ''
};

const priorityOptions = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' }
];

function buildFormValues(task) {
  if (!task) {
    return initialFormValues;
  }

  return {
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'MEDIUM',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
  };
}

function buildChecklistItems(task) {
  return (task?.checklist || []).map((item, index) => ({
    ...item,
    clientId: item.id || crypto.randomUUID(),
    order: item.order ?? index
  }));
}

function FinancialTaskModal({ task, onSubmit, saving = false, formId = 'financial-task-form' }) {
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [checklistItems, setChecklistItems] = useState([]);
  const [errors, setErrors] = useState({});
  const fieldClassName = 'h-11 py-0 text-sm';

  useEffect(() => {
    setFormValues(buildFormValues(task));
    setChecklistItems(buildChecklistItems(task));
    setErrors({});
  }, [task]);

  function handleChange(event) {
    const { name, value } = event.target;

    setErrors((prev) => ({ ...prev, [name]: '' }));

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  }

  function handleDescriptionKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function scrollToFirstError() {
    if (!formRef.current) {
      return;
    }

    const firstError = formRef.current.querySelector('[data-error="true"]');

    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (formValues.title.trim().length < 2) {
      nextErrors.title = 'Informe um titulo com pelo menos 2 caracteres.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError();
      return;
    }

    const payload = {
      title: formValues.title.trim(),
      description: formValues.description.trim() || null,
      priority: formValues.priority || 'MEDIUM',
      dueDate: formValues.dueDate || null,
      checklist: checklistItems
        .filter((item) => item.title.trim().length > 0)
        .map((item, index) => ({
          ...(item.id ? { id: item.id } : {}),
          title: item.title.trim(),
          completed: item.completed,
          order: index
        }))
    };

    await onSubmit(payload);
  }

  return (
    <section>
      <form ref={formRef} id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2">
            <Input label="Titulo" name="title" error={errors.title} value={formValues.title} onChange={handleChange} className={fieldClassName} disabled={saving} />
          </div>

          <div className="md:col-span-2">
            <TaskChecklist items={checklistItems} onChange={setChecklistItems} disabled={saving} />
          </div>

          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Descricao</span>
              <textarea
                name="description"
                value={formValues.description}
                onChange={handleChange}
                onKeyDown={handleDescriptionKeyDown}
                placeholder="Adicione observacoes complementares (opcional)..."
                className="w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                style={{ minHeight: '100px', maxHeight: '250px' }}
                disabled={saving}
              />
            </label>
          </div>

          <Select label="Prioridade" name="priority" value={formValues.priority} onChange={handleChange} className={fieldClassName} disabled={saving}>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Input label="Data limite" name="dueDate" type="date" value={formValues.dueDate} onChange={handleChange} className={fieldClassName} disabled={saving} />
        </div>
      </form>
    </section>
  );
}

export default FinancialTaskModal;
