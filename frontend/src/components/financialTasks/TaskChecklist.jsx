import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, GripVertical, Plus, Trash2 } from 'lucide-react';

import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { cn } from '../../utils/cn';

function getChecklistItemKey(item) {
  return item.id || item.clientId;
}

function createChecklistItem(order = 0) {
  return {
    clientId: crypto.randomUUID(),
    title: '',
    completed: false,
    order
  };
}

function buildOrderedItems(items) {
  return items.map((item, index) => ({
    ...item,
    order: index
  }));
}

function moveItem(items, fromIndex, toIndex) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  nextItems.splice(toIndex, 0, movedItem);

  return buildOrderedItems(nextItems);
}

function TaskChecklist({ items = [], onChange, disabled = false }) {
  const inputRefs = useRef({});
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [focusItemKey, setFocusItemKey] = useState(null);
  const [newItemKey, setNewItemKey] = useState(null);

  const totalItems = items.length;
  const completedItems = items.filter((item) => item.completed).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  useEffect(() => {
    if (!focusItemKey) {
      return;
    }

    const nextInput = inputRefs.current[focusItemKey];

    if (nextInput) {
      nextInput.focus();
      nextInput.select();
      setFocusItemKey(null);
    }
  }, [items, focusItemKey]);

  useEffect(() => {
    if (!newItemKey) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNewItemKey(null);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [newItemKey]);

  function commit(nextItems) {
    onChange?.(buildOrderedItems(nextItems));
  }

  function handleAdd(afterIndex = items.length - 1) {
    if (disabled) {
      return;
    }

    const nextItem = createChecklistItem(items.length);
    const nextItems = [...items];

    nextItems.splice(afterIndex + 1, 0, nextItem);

    const nextItemKey = getChecklistItemKey(nextItem);
    setNewItemKey(nextItemKey);
    setFocusItemKey(nextItemKey);
    commit(nextItems);
  }

  function handleUpdate(itemKey, patch) {
    if (disabled) {
      return;
    }

    commit(
      items.map((item) => (
        getChecklistItemKey(item) === itemKey
          ? { ...item, ...patch }
          : item
      ))
    );
  }

  function handleDelete(itemKey) {
    if (disabled) {
      return;
    }

    commit(items.filter((item) => getChecklistItemKey(item) !== itemKey));
  }

  function handleMove(index, direction) {
    if (disabled) {
      return;
    }

    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= items.length) {
      return;
    }

    const reorderedItems = moveItem(items, index, targetIndex);
    setFocusItemKey(getChecklistItemKey(reorderedItems[targetIndex]));
    commit(reorderedItems);
  }

  function handleKeyDown(event, index) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAdd(index);
    }
  }

  function handleDragStart(index) {
    if (disabled || items.length < 2) {
      return;
    }

    setDragIndex(index);
    setDragOverIndex(index);
  }

  function handleDragOver(event, index) {
    if (dragIndex === null || dragIndex === index) {
      return;
    }

    event.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(event, index) {
    event.preventDefault();

    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedItems = moveItem(items, dragIndex, index);
    setDragIndex(null);
    setDragOverIndex(null);
    setFocusItemKey(getChecklistItemKey(reorderedItems[index]));
    commit(reorderedItems);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes checklist-item-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700/70 dark:bg-slate-800/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Checklist</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {totalItems > 0 ? `${completedItems} de ${totalItems} itens concluidos` : 'Adicione itens para acompanhar o progresso da tarefa.'}
            </p>
          </div>

          <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => handleAdd()} disabled={disabled}>
            <Plus className="h-4 w-4" />
            Adicionar item
          </Button>
        </div>

        {totalItems > 0 ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const itemKey = getChecklistItemKey(item);
          const isNewItem = itemKey === newItemKey;

          return (
            <div
              key={itemKey}
              className={cn(
                'rounded-2xl border px-3 py-3 transition-all duration-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 dark:focus-within:ring-emerald-900/30',
                item.completed
                  ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-900/15'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60',
                dragOverIndex === index ? 'border-emerald-300 dark:border-emerald-700' : '',
                dragIndex === index ? 'scale-[0.99] opacity-60' : '',
                isNewItem ? 'animate-[checklist-item-in_180ms_ease-out]' : ''
              )}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={(event) => handleDrop(event, index)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Tooltip content="Arrastar para reordenar">
                    <button
                      type="button"
                      className="hidden cursor-grab text-slate-300 transition hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 sm:inline-flex"
                      draggable={!disabled && items.length > 1}
                      onDragStart={() => handleDragStart(index)}
                      onDragEnd={handleDragEnd}
                      aria-label="Arrastar para reordenar"
                      disabled={disabled || items.length < 2}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </Tooltip>

                  <button
                    type="button"
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
                      item.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'border-slate-300 bg-white hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-emerald-500'
                    )}
                    onClick={() => handleUpdate(itemKey, { completed: !item.completed })}
                    aria-label={item.completed ? 'Marcar item como pendente' : 'Marcar item como concluido'}
                    disabled={disabled}
                  >
                    <Check className={cn('h-3.5 w-3.5 transition-transform duration-200', item.completed ? 'scale-100' : 'scale-0')} />
                  </button>
                </div>

                <input
                  ref={(node) => {
                    if (node) {
                      inputRefs.current[itemKey] = node;
                    } else {
                      delete inputRefs.current[itemKey];
                    }
                  }}
                  type="text"
                  value={item.title}
                  onChange={(event) => handleUpdate(itemKey, { title: event.target.value })}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  placeholder="Descreva o item do checklist"
                  className={cn(
                    'min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none transition placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500',
                    item.completed ? 'text-slate-500 line-through dark:text-slate-400' : ''
                  )}
                  disabled={disabled}
                />

                <div className="flex items-center justify-end gap-1 sm:ml-auto">
                  <Tooltip content="Subir item">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 sm:h-9 sm:w-9"
                      onClick={() => handleMove(index, -1)}
                      disabled={disabled || index === 0}
                      aria-label="Subir item"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Descer item">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 sm:h-9 sm:w-9"
                      onClick={() => handleMove(index, 1)}
                      disabled={disabled || index === items.length - 1}
                      aria-label="Descer item"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Excluir item">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-300 sm:h-9 sm:w-9"
                      onClick={() => handleDelete(itemKey)}
                      aria-label="Excluir item"
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TaskChecklist;
