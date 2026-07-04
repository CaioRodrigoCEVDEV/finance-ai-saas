import { useEffect, useRef, useState } from 'react';
import { Check, GripVertical, Plus, Trash2, Pencil, X } from 'lucide-react';

import Button from '../ui/Button';

function TaskChecklist({ items = [], onAdd, onUpdate, onDelete, onReorder, saving }) {
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const [newItemId, setNewItemId] = useState(null);
  const [error, setError] = useState('');
  const newItemRef = useRef(null);
  const prevCountRef = useRef(items.length);

  useEffect(() => {
    if (items.length > prevCountRef.current) {
      const latest = items[items.length - 1];
      setNewItemId(latest.id);
      const timer = setTimeout(() => setNewItemId(null), 300);
      prevCountRef.current = items.length;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = items.length;
  }, [items.length]);

  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  function validate(text) {
    if (!text) return 'Informe o item.';
    if (items.length > 0) {
      const last = items[items.length - 1];
      if (last.description.toLowerCase() === text.toLowerCase()) {
        return 'Item ja adicionado.';
      }
    }
    return '';
  }

  async function handleAdd() {
    const text = newItemText.trim();
    const validationError = validate(text);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    if (onAdd) {
      try {
        await onAdd({ description: text });
        setNewItemText('');
        newItemRef.current?.focus();
      } catch {
        // handled by page toast
      }
    }
  }

  function handleAddKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  }

  function handleInputChange(e) {
    setNewItemText(e.target.value);
    if (error) setError('');
  }

  function handleToggle(item) {
    if (onUpdate) {
      onUpdate(item.id, { completed: !item.completed });
    }
  }

  function handleStartEdit(item) {
    setEditingId(item.id);
    setEditText(item.description);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  function handleSaveEdit() {
    const text = editText.trim();
    if (!text) {
      setEditingId(null);
      return;
    }

    setEditingId(null);

    if (onUpdate) {
      onUpdate(editingId, { description: text });
    }
  }

  function handleEditKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSaveEdit();
    }
    if (event.key === 'Escape') {
      handleCancelEdit();
    }
  }

  function handleDelete(itemId) {
    if (onDelete) {
      onDelete(itemId);
    }
  }

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(event, index) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragIndex(index);
  }

  function handleDragEnd() {
    if (dragIndex === null) return;
    setDragIndex(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Checklist {total > 0 ? `(${completed}/${total})` : ''}
        </p>
        {total > 0 ? (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{progress}%</span>
        ) : null}
      </div>

      <style>{`
        @keyframes checklist-item-in {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {total > 0 ? (
        <>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-1">
            {items.map((item, index) => {
              const isNew = item.id === newItemId;
              return (
                <div
                  key={item.id}
                  className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-150 ${
                    isNew ? 'animate-[checklist-item-in_150ms_ease-out]' : ''
                  } ${
                    item.completed
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
                  } ${dragIndex === index ? 'scale-[0.97] opacity-50' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <button
                    type="button"
                    className="cursor-grab touch-none text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"
                    title="Arrastar para reordenar"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                      item.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 hover:border-emerald-400 dark:border-slate-600 dark:hover:border-emerald-500'
                    }`}
                  >
                    {item.completed ? <Check className="h-3 w-3" /> : null}
                  </button>

                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={handleSaveEdit}
                      className="min-w-0 flex-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none transition-all duration-150 focus:ring-2 focus:ring-emerald-200 dark:border-emerald-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-emerald-800"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`min-w-0 flex-1 cursor-pointer text-sm transition-all duration-150 ${
                        item.completed
                          ? 'text-slate-400 line-through dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                      onClick={() => handleStartEdit(item)}
                    >
                      {item.description}
                    </span>
                  )}

                  <div className="flex shrink-0 gap-1 opacity-0 transition-all duration-150 group-hover:opacity-100">
                    {editingId === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                          title="Salvar"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                          title="Cancelar"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum item adicionado.</p>
      )}

      <div className="space-y-1">
        <div className="flex gap-2">
          <input
            ref={newItemRef}
            type="text"
            value={newItemText}
            onChange={handleInputChange}
            onKeyDown={handleAddKeyDown}
            placeholder="Novo item..."
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
          />
          <Button type="button" size="sm" onClick={handleAdd} disabled={!newItemText.trim() || saving}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
        {error ? (
          <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

export default TaskChecklist;
