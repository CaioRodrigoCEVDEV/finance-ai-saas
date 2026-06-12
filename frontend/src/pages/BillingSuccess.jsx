import { useEffect, useState } from 'react';

import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { getBillingCurrent } from '../services/billingService';

function BillingSuccess() {
  const { updateTenant } = useAuth();
  const [status, setStatus] = useState('Carregando confirmação...');

  useEffect(() => {
    async function loadStatus() {
      try {
        const current = await getBillingCurrent();
        setStatus(`Status atual: ${current.status}`);
        if (current.plan === 'PREMIUM' && current.status === 'ACTIVE') {
          updateTenant({ plan: 'PREMIUM' });
        }
      } catch {
        setStatus('Ainda estamos aguardando a confirmação do pagamento.');
      }
    }

    loadStatus();
  }, [updateTenant]);

  return (
    <AppLayout>
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Pagamento recebido</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Estamos confirmando sua assinatura. Isso pode levar alguns instantes.</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{status}</p>
      </Card>
    </AppLayout>
  );
}

export default BillingSuccess;
