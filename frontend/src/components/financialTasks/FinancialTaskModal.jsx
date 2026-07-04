import { useCallback, useEffect, useRef, useState } from 'react';

import Input from '../ui/Input';
import Select from '../ui/Select';
import TaskChecklist from './TaskChecklist';

const initialFormValues = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  estimatedAmount: '',
  accountId: '',
  reminderAt: '',
  autoComplete: false
};

const priorityOptions = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' }
];

const statusOptions = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluida' },
  { value: 'CANCELLED', label: 'Cancelada' }
];

function buildFormValues(task) {
  if (!task) {
    return initialFormValues;
  }

  return {
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'MEDIUM',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    estimatedAmount: task.estimatedAmount ? String(task.estimatedAmount) : '',
    accountId: task.accountId || '',
    reminderAt: task.reminderAt ? task.reminderAt.split('T')[0] : '',
    autoComplete: task.autoComplete || false
  };
}

function FinancialTaskModal({ task, accounts, onSubmit, formId = 'financial-task-form', onItemAdd, onItemUpdate, onItemDelete, onItemReorder }) {
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [checklistItems, setChecklistItems] = useState([]);
  const checklistRef = useRef(checklistItems);
  checklistRef.current = checklistItems;
  const fieldClassName = 'h-11 py-0 text-sm';

  useEffect(() => {
    setFormValues(buildFormValues(task));
    setErrors({});
    setChecklistItems(task?.items || []);
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

    const estimatedAmount = formValues.estimatedAmount
      ? Number(formValues.estimatedAmount)
      : null;

    if (estimatedAmount !== null && (!Number.isFinite(estimatedAmount) || estimatedAmount <= 0)) {
      nextErrors.estimatedAmount = 'Valor previsto deve ser maior que zero.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError();
      return;
    }

    const payload = {
      title: formValues.title.trim(),
      description: formValues.description.trim() || undefined,
      priority: formValues.priority || 'MEDIUM',
      accountId: formValues.accountId || undefined
    };

    if (formValues.dueDate) {
      payload.dueDate = formValues.dueDate;
    }

    if (estimatedAmount !== null) {
      payload.estimatedAmount = estimatedAmount;
    }

    if (formValues.reminderAt) {
      payload.reminderAt = formValues.reminderAt;
    } else {
      payload.reminderAt = null;
    }

    payload.autoComplete = formValues.autoComplete;

    if (!task?.id && checklistItems.length > 0) {
      payload.items = checklistItems.map((item) => ({
        description: item.description,
        completed: item.completed,
        order: item.order
      }));
    }

    await onSubmit(payload);
  }

  const handleLocalItemAdd = useCallback(async (payload) => {
    if (task?.id && onItemAdd) {
      const createdItem = await onItemAdd(payload);
      if (createdItem) {
        setChecklistItems((prev) => [...prev, createdItem]);
      }
    } else {
      setChecklistItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), description: payload.description, completed: false, order: prev.length }
      ]);
    }
  }, [onItemAdd, task?.id]);

  const handleLocalItemUpdate = useCallback((itemId, payload) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...payload } : item
      )
    );

    if (onItemUpdate && task?.id) {
      onItemUpdate(itemId, payload);
    }
  }, [onItemUpdate, task?.id]);

  const handleLocalItemDelete = useCallback((itemId) => {
    const prev = checklistRef.current;
    setChecklistItems((prev) => prev.filter((i) => i.id !== itemId));

    if (onItemDelete && task?.id) {
      onItemDelete(itemId, () => {
        setChecklistItems(prev);
      });
    }
  }, [onItemDelete, task?.id]);

  const handleLocalItemReorder = useCallback((items) => {
    setChecklistItems((prev) => {
      const next = [...prev];
      const orderMap = {};
      items.forEach((item) => { orderMap[item.id] = item.order; });
      next.sort((a, b) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0));
      return next;
    });

    if (onItemReorder && task?.id) {
      onItemReorder(items);
    }
  }, [onItemReorder, task?.id]);

  const isSaving = false;

  return (
    <section>
      <form ref={formRef} id={formId} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="md:col-span-2">
            <Input label="Titulo" name="title" error={errors.title} value={formValues.title} onChange={handleChange} className={fieldClassName} />
          </div>

          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Descricao</span>
              <textarea
                name="description"
                value={formValues.description}
                onChange={handleChange}
                onKeyDown={handleDescriptionKeyDown}
                placeholder="Lista mercado:&#10;&#8226; Arroz&#10;&#8226; Feijao&#10;&#8226; Carne&#10;&#10;Observacoes:&#10;Comprar na promocao."
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                style={{ minHeight: '120px', maxHeight: '250px' }}
              />
            </label>
          </div>

          <Select label="Prioridade" name="priority" value={formValues.priority} onChange={handleChange} className={fieldClassName}>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>

          <Input label="Data limite" name="dueDate" type="date" value={formValues.dueDate} onChange={handleChange} className={fieldClassName} />

          <Input label="Valor previsto" name="estimatedAmount" type="number" step="0.01" min="0" error={errors.estimatedAmount} value={formValues.estimatedAmount} onChange={handleChange} className={fieldClassName} />

          <Select label="Conta vinculada" name="accountId" value={formValues.accountId} onChange={handleChange} className={fieldClassName}>
            <option value="">Nenhuma</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>

          <Input label="Lembrete" name="reminderAt" type="date" value={formValues.reminderAt} onChange={handleChange} className={fieldClassName} />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoComplete"
            name="autoComplete"
            checked={formValues.autoComplete}
            onChange={(e) => setFormValues((prev) => ({ ...prev, autoComplete: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700"
          />
          <label htmlFor="autoComplete" className="text-sm text-slate-600 dark:text-slate-400">
            Concluir automaticamente quando todos os itens forem concluidos
          </label>
        </div>

        <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
          <TaskChecklist
            items={checklistItems}
            onAdd={handleLocalItemAdd}
            onUpdate={handleLocalItemUpdate}
            onDelete={handleLocalItemDelete}
            onReorder={handleLocalItemReorder}
            saving={isSaving}
          />
        </div>
      </form>
    </section>
  );
}

export default FinancialTaskModal;
