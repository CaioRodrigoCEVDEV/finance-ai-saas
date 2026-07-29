import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

const options = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Automático', icon: Monitor }
];

function ThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open]);

  function handleSelect(value) {
    setTheme(value);
    setOpen(false);
  }

  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-surface text-content-secondary shadow-card transition',
          'hover:-translate-y-0.5 hover:bg-surface-hover hover:text-content-primary'
        )}
        aria-label="Alternar tema"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Alterar tema"
      >
        <CurrentIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className={cn(
          'absolute right-0 top-full z-50 mt-2 w-44 rounded-2xl border border-border-ui bg-surface p-1.5 shadow-floating'
        )}>
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
