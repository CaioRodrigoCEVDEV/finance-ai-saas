import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';

function BillingCancel() {
  return (
    <AppLayout>
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Assinatura não concluída</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Assinatura não concluída.</p>
      </Card>
    </AppLayout>
  );
}

export default BillingCancel;
