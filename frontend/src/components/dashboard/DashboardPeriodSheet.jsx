import { Check } from 'lucide-react';

import Modal from '../ui/Modal';
import {
  buildAvailablePeriodOptions,
  getDashboardPeriodKey,
  parseDashboardPeriodValue
} from '../../utils/dashboardPeriod';

function DashboardPeriodSheet({ period, availablePeriods, onSelect, onClose }) {
  const options = buildAvailablePeriodOptions(availablePeriods);
  const currentKey = getDashboardPeriodKey(period);

  function handleSelect(value) {
    const nextPeriod = parseDashboardPeriodValue(value);
    if (nextPeriod) onSelect(nextPeriod);
    onClose();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Selecionar período"
      className="max-w-sm"
      bodyClassName="!p-0"
    >
      <div className="max-h-[55vh] overflow-y-auto overscroll-contain py-1">
        {options.length > 0 ? (
          options.map((option) => {
            const isSelected = option.value === currentKey;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="flex w-full items-center justify-between px-5 py-3 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
              >
                <span className={isSelected ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}>
                  {option.label}
                </span>
                {isSelected ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                ) : null}
              </button>
            );
          })
        ) : (
          <p className="px-5 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Nenhuma movimentação encontrada
          </p>
        )}
      </div>
    </Modal>
  );
}

export default DashboardPeriodSheet;
