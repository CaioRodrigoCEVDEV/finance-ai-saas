import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import Card from '../ui/Card';

const severityConfig = {
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    text: 'text-amber-700'
  },
  danger: {
    icon: AlertTriangle,
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-100',
    text: 'text-rose-700'
  },
  info: {
    icon: Info,
    border: 'border-sky-200',
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-100',
    text: 'text-sky-700'
  }
};

function DashboardAlerts({ alerts }) {
  return (
    <Card className="rounded-[28px] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Alertas inteligentes</h2>
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">
            Sem alertas no momento. Sua vida financeira está sob controle.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const config = severityConfig[alert.severity] || severityConfig.info;
            const Icon = config.icon;

            return (
              <div
                key={`${alert.type}-${alert.entityId || index}`}
                className={`flex items-start gap-3 rounded-2xl border ${config.border} ${config.bg} p-4`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${config.iconBg}`}>
                  <Icon className={`h-4 w-4 ${config.text}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                  <p className={`mt-1 text-sm ${config.text}`}>{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default DashboardAlerts;
