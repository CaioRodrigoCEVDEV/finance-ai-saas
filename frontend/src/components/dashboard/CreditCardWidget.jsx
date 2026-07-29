import { CreditCard } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/StatusBadge';
import Tooltip from '../ui/Tooltip';
import { usePrivacy } from '../../contexts/PrivacyContext';

function CreditCardWidget({ data }) {
  const { formatCurrencyPrivacy } = usePrivacy();

  if (!data) return null;

  const { totalCards, activeCards, totalLimit, currentInvoiceAmount, availableLimit, usagePercentage } = data;

  const usageStatus = usagePercentage > 80 ? 'critical' : usagePercentage > 60 ? 'warning' : 'healthy';
  const statusLabel = usagePercentage > 80 ? 'Crítico' : usagePercentage > 60 ? 'Atenção' : 'Saudável';

  return (
    <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-purple/25 hover:shadow-floating sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-content-primary">Cartões de crédito</h3>
            <p className="mt-0.5 text-xs text-content-muted">Resumo dos cartões cadastrados</p>
          </div>
        </div>
        <StatusBadge status={usageStatus} label={statusLabel} />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-content-secondary">Cartões ativos</span>
          <span className="font-semibold text-content-primary">{activeCards} de {totalCards}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-content-secondary">Limite total</span>
          <span className="font-semibold text-content-primary">{formatCurrencyPrivacy(totalLimit)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-content-secondary">Fatura atual</span>
          <span className="font-semibold text-danger">{formatCurrencyPrivacy(currentInvoiceAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-content-secondary">Limite disponível</span>
          <span className="font-semibold text-success">{formatCurrencyPrivacy(availableLimit)}</span>
        </div>
      </div>

      <div className="mt-5 border-t border-border-soft pt-4">
        <Tooltip content="Uso do limite disponível">
          <div className="mb-2 flex items-center justify-between text-xs text-content-secondary">
            <span>Uso do limite</span>
            <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
          </div>
        </Tooltip>
        <ProgressBar value={usagePercentage} color="indigo" />
      </div>
    </Card>
  );
}

export default CreditCardWidget;
