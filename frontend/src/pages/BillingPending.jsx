import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';

function BillingPending() {
  return (
    <AppLayout>
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Pagamento pendente</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Pagamento pendente. Assim que for confirmado, o plano será ativado automaticamente.</p>
      </Card>
    </AppLayout>
  );
}

export default BillingPending;
