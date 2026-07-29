import { ArrowRight, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';

function PlanStatusCard({ plan = 'FREE' }) {
  const { tenant } = useAuth();
  const hasPaidPlan = plan !== 'FREE';
  const canManagePlan = tenant?.role === 'OWNER';

  return (
    <Card className="relative min-h-[178px] overflow-hidden !border-primary/15 !bg-primary/10 p-5 sm:p-6">
      <div className="relative z-10 max-w-full sm:max-w-[68%]">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Crown className="h-4 w-4" />
          {hasPaidPlan ? 'PLANO ATIVO' : 'FINANCEAI PREMIUM'}
        </div>
        <h2 className="mt-3 text-xl font-bold tracking-[-0.03em] text-content-primary">
          {hasPaidPlan ? `FinanceAI ${plan}` : 'Conheça o FinanceAI Premium'}
        </h2>
        <p className="mt-2 text-sm leading-5 text-content-secondary">
          {hasPaidPlan
            ? 'Seu plano está ativo e os recursos contratados estão disponíveis.'
            : 'Tenha relatórios, automações e mais liberdade para organizar suas finanças.'}
        </p>
        <Link
          to="/plans"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-[13px] bg-primary px-4 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-hover"
        >
          {canManagePlan && hasPaidPlan ? 'Gerenciar plano' : 'Ver detalhes'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="absolute bottom-4 right-4 hidden h-24 w-32 items-center justify-center rounded-[22px] border border-white/50 bg-surface/70 shadow-card backdrop-blur-sm sm:flex" aria-hidden="true">
        <span className="absolute left-4 top-5 h-10 w-10 rounded-full bg-primary/15 blur-sm" />
        <span className="absolute right-5 top-3 h-14 w-7 rounded-full bg-emerald-200 dark:bg-emerald-300" />
        <span className="absolute bottom-3 right-4 h-10 w-10 rounded-full bg-primary" />
      </div>
    </Card>
  );
}

export default PlanStatusCard;
