import { Plus, X } from 'lucide-react';

import { cn } from '../../utils/cn';

function QuickAddFAB({ open, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Fechar quick add' : 'Adicionar lançamento'}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn(
        'fixed z-40 flex h-14 w-14 items-center justify-center rounded-full',
        'bg-emerald-600 text-white shadow-lg',
        'transition-all duration-200',
        'hover:bg-emerald-700 active:scale-90',
        'dark:bg-emerald-500 dark:hover:bg-emerald-400',
        'bottom-6 right-6',
        'max-lg:hidden',
        open && 'opacity-80 scale-95',
        className
      )}
    >
      <span
        className={cn(
          'inline-flex transition-transform duration-200',
          open ? 'rotate-45 scale-95' : 'rotate-0 scale-100'
        )}
      >
        <Plus className="h-6 w-6" />
      </span>
    </button>
  );
}

export default QuickAddFAB;
