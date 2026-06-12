import { useEffect, useState } from 'react';

import AdminLayout from '../../layouts/admin/AdminLayout';
import Card from '../../components/ui/Card';
import MetricCard from '../../components/MetricCard';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Badge from '../../components/ui/Badge';
import { getAdminDashboard } from '../../services/adminService';
import { useToast } from '../../contexts/ToastContext';
import { formatDateBR } from '../../utils/formatters';

const planVariant = {
  FREE: 'neutral',
  PREMIUM: 'info',
  PRO: 'success',
  FAMILY: 'secondary'
};

const planLabel = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  PRO: 'PRO',
  FAMILY: 'FAMILY'
};

const statusVariant = {
  ACTIVE: 'success',
  BLOCKED: 'danger',
  INACTIVE: 'warning'
};

const statusLabel = {
  ACTIVE: 'Ativo',
  BLOCKED: 'Bloqueado',
  INACTIVE: 'Inativo'
};

const globalRoleVariant = {
  SUPER_ADMIN: 'warning',
  USER: 'neutral'
};

const globalRoleLabel = {
  SUPER_ADMIN: 'Super Admin',
  USER: 'Usuário'
};

function AdminDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');
        const result = await getAdminDashboard();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) {
          const message =
            err?.response?.data?.error ||
            err?.message ||
            'Erro ao carregar painel administrativo';
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8 pb-8">
          <LoadingSkeleton className="h-48 rounded-[28px]" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 7 }, (_, i) => (
              <LoadingSkeleton key={i} className="h-[140px] rounded-[28px]" />
            ))}
          </div>
          {Array.from({ length: 3 }, (_, i) => (
            <LoadingSkeleton key={i} className="h-64 rounded-[28px]" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-8 pb-8">
          <Card className="border-rose-200 bg-rose-50 p-8 dark:border-rose-800 dark:bg-rose-900/20">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-800 dark:text-rose-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Falha ao carregar painel</p>
                <p className="mt-2 text-sm text-rose-700 dark:text-rose-400">{error}</p>
              </div>
            </div>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-8">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-400">Painel Administrativo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Painel Administrativo</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Visão geral do SaaS</p>
        </Card>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Workspaces"
            value={data.totalTenants}
            description="Workspaces ativos na plataforma"
          />
          <MetricCard
            title="Total Usuários"
            value={data.totalUsers}
            description="Usuários cadastrados"
          />
          <MetricCard
            title="Planos FREE"
            value={data.totalFreeTenants}
            description="Workspaces no plano gratuito"
          />
          <MetricCard
            title="Planos Premium"
            value={data.totalPremiumTenants}
            description="Workspaces em planos pagos"
          />
          <MetricCard
            title="Suspensos"
            value={data.totalSuspendedTenants}
            description="Workspaces suspensos ou bloqueados"
          />
          <MetricCard
            title="Novos usuários no mês"
            value={data.newUsersThisMonth}
            description="Cadastros este mês"
          />
          <MetricCard
            title="Novos workspaces no mês"
            value={data.newTenantsThisMonth}
            description="Criados este mês"
          />
        </div>

        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Últimos Workspaces Criados</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Workspaces recentemente registrados na plataforma</p>
          </div>
          {data.recentTenants.length === 0 ? (
            <p className="py-4 text-sm text-slate-500 dark:text-slate-400">Nenhum dado disponível</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Nome</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Plano</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Dono</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Usuários</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">{tenant.name}</td>
                      <td className="px-3 py-3">
                        <Badge variant={planVariant[tenant.plan] || 'neutral'}>
                          {planLabel[tenant.plan] || tenant.plan}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={statusVariant[tenant.status] || 'neutral'}>
                          {statusLabel[tenant.status] || tenant.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                        {tenant.owner?.name || '--'}
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{tenant.userCount}</td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{formatDateBR(tenant.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Últimos Usuários</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Usuários recentemente registrados na plataforma</p>
          </div>
          {data.recentUsers.length === 0 ? (
            <p className="py-4 text-sm text-slate-500 dark:text-slate-400">Nenhum dado disponível</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Nome</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Papel Global</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="px-3 py-3">
                        <Badge variant={globalRoleVariant[user.globalRole] || 'neutral'}>
                          {user.globalRole === 'SUPER_ADMIN' ? '⚡ ' : ''}
                          {globalRoleLabel[user.globalRole] || user.globalRole}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={statusVariant[user.status] || 'neutral'}>
                          {statusLabel[user.status] || user.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{formatDateBR(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Últimos Logs de Auditoria</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Atividades recentes registradas no sistema</p>
          </div>
          {data.recentAuditLogs.length === 0 ? (
            <p className="py-4 text-sm text-slate-500 dark:text-slate-400">Nenhum dado disponível</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Ação</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Entidade</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Usuário</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Tenant</th>
                    <th className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAuditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-3">
                        <Badge variant="neutral" className="font-mono text-[11px]">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{log.entity}</td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{log.userName || '--'}</td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{log.tenantName || '--'}</td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{formatDateBR(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
