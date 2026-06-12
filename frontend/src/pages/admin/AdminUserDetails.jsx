import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Building2 } from 'lucide-react';

import AdminLayout from '../../layouts/admin/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';
import { getUser, updateUser, blockUser, unblockUser, resetUserPassword } from '../../services/adminService';
import { formatDateBR } from '../../utils/formatters';

const STATUS_BADGE = {
  ACTIVE: { variant: 'success', label: 'Ativo' },
  INACTIVE: { variant: 'warning', label: 'Inativo' },
  BLOCKED: { variant: 'danger', label: 'Bloqueado' }
};

const PLAN_BADGE = {
  PREMIUM: { variant: 'info', label: 'Premium' },
  PRO: { variant: 'success', label: 'Pro' },
  FREE: { variant: 'neutral', label: 'Free' },
  FAMILY: { variant: 'secondary', label: 'Família' }
};

const TENANT_STATUS_BADGE = {
  ACTIVE: { variant: 'success', label: 'Ativo' },
  INACTIVE: { variant: 'warning', label: 'Inativo' },
  BLOCKED: { variant: 'danger', label: 'Bloqueado' }
};

const ROLE_BADGE = {
  OWNER: { variant: 'info', label: 'Proprietário' },
  ADMIN: { variant: 'success', label: 'Admin' },
  MEMBER: { variant: 'neutral', label: 'Membro' },
  READONLY: { variant: 'secondary', label: 'Somente leitura' }
};

function AdminUserDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [blockModal, setBlockModal] = useState({ isOpen: false, action: '' });
  const [resetPasswordModal, setResetPasswordModal] = useState({ isOpen: false, password: '' });
  const [changeNameModal, setChangeNameModal] = useState({ isOpen: false, name: '' });
  const [changeEmailModal, setChangeEmailModal] = useState({ isOpen: false, email: '' });
  const [changeGlobalRoleModal, setChangeGlobalRoleModal] = useState({ isOpen: false, globalRole: '' });

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getUser(id);
      setUser(data);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : requestError.response?.data?.message || 'Não foi possível carregar os dados do usuário.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, []);

  function openBlockModal(action) {
    setBlockModal({ isOpen: true, action });
  }

  function closeBlockModal() {
    setBlockModal({ isOpen: false, action: '' });
  }

  async function handleBlockAction() {
    const { action } = blockModal;
    if (!action) return;

    try {
      setActionLoading(true);

      if (action === 'block') {
        await blockUser(user.id);
        toast.success(`Usuário ${user.name} bloqueado com sucesso.`);
      } else {
        await unblockUser(user.id);
        toast.success(`Usuário ${user.name} desbloqueado com sucesso.`);
      }

      closeBlockModal();
      await loadUser();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Falha ao executar a ação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  function openResetPasswordModal() {
    setResetPasswordModal({ isOpen: true, password: '' });
  }

  function closeResetPasswordModal() {
    setResetPasswordModal({ isOpen: false, password: '' });
  }

  async function handleResetPassword() {
    const { password } = resetPasswordModal;
    if (!password || password.length < 6) return;

    try {
      setActionLoading(true);

      await resetUserPassword(user.id, password);
      toast.success(`Senha do usuário ${user.name} redefinida com sucesso.`);
      closeResetPasswordModal();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Falha ao redefinir a senha. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  function openChangeNameModal() {
    setChangeNameModal({ isOpen: true, name: user?.name || '' });
  }

  function closeChangeNameModal() {
    setChangeNameModal({ isOpen: false, name: '' });
  }

  async function handleChangeName() {
    const { name } = changeNameModal;
    if (!name || !name.trim()) return;

    try {
      setActionLoading(true);

      await updateUser(user.id, { name: name.trim() });
      toast.success(`Nome alterado com sucesso.`);
      closeChangeNameModal();
      await loadUser();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Falha ao alterar o nome. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  function openChangeEmailModal() {
    setChangeEmailModal({ isOpen: true, email: user?.email || '' });
  }

  function closeChangeEmailModal() {
    setChangeEmailModal({ isOpen: false, email: '' });
  }

  async function handleChangeEmail() {
    const { email } = changeEmailModal;
    if (!email || !email.trim()) return;

    try {
      setActionLoading(true);

      await updateUser(user.id, { email: email.trim() });
      toast.success(`Email alterado com sucesso.`);
      closeChangeEmailModal();
      await loadUser();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Falha ao alterar o email. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  function openChangeGlobalRoleModal() {
    setChangeGlobalRoleModal({ isOpen: true, globalRole: user?.globalRole || 'USER' });
  }

  function closeChangeGlobalRoleModal() {
    setChangeGlobalRoleModal({ isOpen: false, globalRole: '' });
  }

  async function handleChangeGlobalRole() {
    const { globalRole } = changeGlobalRoleModal;
    if (!globalRole) return;

    try {
      setActionLoading(true);

      await updateUser(user.id, { globalRole });
      toast.success(`Perfil global alterado com sucesso.`);
      closeChangeGlobalRoleModal();
      await loadUser();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Falha ao alterar o perfil global. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }

  function renderSkeleton() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LoadingSkeleton className="h-9 w-24" />
        </div>
        <Card>
          <div className="space-y-4">
            <LoadingSkeleton className="h-6 w-48" />
            <LoadingSkeleton className="h-5 w-80" />
            <LoadingSkeleton className="h-5 w-64" />
            <LoadingSkeleton className="h-5 w-40" />
          </div>
        </Card>
        <Card>
          <div className="space-y-3">
            <LoadingSkeleton className="h-6 w-36" />
            {[1, 2, 3].map((item) => (
              <LoadingSkeleton key={item} className="h-12 rounded-[28px]" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  function renderError() {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <Card className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20">
            <div className="flex items-center gap-3">
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
              <Button variant="secondary" size="sm" onClick={loadUser}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        {renderSkeleton()}
      </AdminLayout>
    );
  }

  if (error || !user) {
    return renderError();
  }

  const statusInfo = STATUS_BADGE[user.status] || { variant: 'neutral', label: user.status };
  const memberships = user.memberships || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{user.name}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              {user.globalRole === 'SUPER_ADMIN' ? (
                <Badge variant="warning">{'\u26A1'} Super Admin</Badge>
              ) : (
                <Badge variant="neutral">Usuário</Badge>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Criado em</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{formatDateBR(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Atualizado em</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{formatDateBR(user.updatedAt)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-6 dark:border-slate-700">
            {user.status === 'BLOCKED' ? (
              <Button variant="secondary" size="sm" onClick={() => openBlockModal('unblock')} disabled={actionLoading}>
                Desbloquear
              </Button>
            ) : (
              <Button variant="danger" size="sm" onClick={() => openBlockModal('block')} disabled={actionLoading}>
                Bloquear
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={openResetPasswordModal} disabled={actionLoading}>
              Redefinir Senha
            </Button>
            <Button variant="secondary" size="sm" onClick={openChangeNameModal} disabled={actionLoading}>
              Alterar Nome
            </Button>
            <Button variant="secondary" size="sm" onClick={openChangeEmailModal} disabled={actionLoading}>
              Alterar Email
            </Button>
            <Button variant="secondary" size="sm" onClick={openChangeGlobalRoleModal} disabled={actionLoading}>
              Alterar Role Global
            </Button>
          </div>
        </Card>

        <Card className="overflow-x-auto p-0">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-700">
            <Building2 className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tenants</h2>
            {memberships.length > 0 ? (
              <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                {memberships.length} tenant{memberships.length !== 1 ? 's' : ''}
              </span>
            ) : null}
          </div>

          {memberships.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Building2 className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Este usuário não pertence a nenhum tenant.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Tenant</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Plano</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Papel</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status do tenant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {memberships.map((membership) => {
                  const planInfo = PLAN_BADGE[membership.tenant?.plan] || { variant: 'neutral', label: membership.tenant?.plan || '-' };
                  const roleInfo = ROLE_BADGE[membership.role] || { variant: 'neutral', label: membership.role };
                  const tenantStatusInfo = TENANT_STATUS_BADGE[membership.tenant?.status] || { variant: 'neutral', label: membership.tenant?.status || '-' };

                  return (
                    <tr key={membership.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {membership.tenant?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={planInfo.variant}>{planInfo.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={tenantStatusInfo.variant}>{tenantStatusInfo.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Modal
          isOpen={blockModal.isOpen}
          title={blockModal.action === 'block' ? 'Bloquear usuário' : 'Desbloquear usuário'}
          onClose={closeBlockModal}
        >
          <div className="space-y-6">
            {blockModal.action === 'block' ? (
              <p className="text-slate-600 dark:text-slate-400">
                Tem certeza que deseja <strong className="text-slate-900 dark:text-slate-100">bloquear</strong> o usuário{' '}
                <strong className="text-slate-900 dark:text-slate-100">{user.name}</strong>?{' '}
                O usuário não poderá acessar a plataforma enquanto estiver bloqueado.
              </p>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                Tem certeza que deseja <strong className="text-slate-900 dark:text-slate-100">desbloquear</strong> o usuário{' '}
                <strong className="text-slate-900 dark:text-slate-100">{user.name}</strong>?{' '}
                O usuário poderá acessar a plataforma normalmente.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeBlockModal} disabled={actionLoading}>
                Cancelar
              </Button>
              <Button
                variant={blockModal.action === 'block' ? 'danger' : 'primary'}
                onClick={handleBlockAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processando...' : blockModal.action === 'block' ? 'Sim, bloquear' : 'Sim, desbloquear'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={resetPasswordModal.isOpen}
          title="Redefinir Senha"
          onClose={closeResetPasswordModal}
        >
          <div className="space-y-6">
            <Input
              label="Nova senha"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={resetPasswordModal.password}
              onChange={(e) => setResetPasswordModal((prev) => ({ ...prev, password: e.target.value }))}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeResetPasswordModal} disabled={actionLoading}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleResetPassword}
                disabled={actionLoading || (resetPasswordModal.password || '').length < 6}
              >
                {actionLoading ? 'Redefinindo...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={changeNameModal.isOpen}
          title="Alterar Nome"
          onClose={closeChangeNameModal}
        >
          <div className="space-y-6">
            <Input
              label="Nome"
              placeholder="Novo nome do usuário"
              value={changeNameModal.name}
              onChange={(e) => setChangeNameModal((prev) => ({ ...prev, name: e.target.value }))}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeChangeNameModal} disabled={actionLoading}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleChangeName}
                disabled={actionLoading || !changeNameModal.name.trim()}
              >
                {actionLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={changeEmailModal.isOpen}
          title="Alterar Email"
          onClose={closeChangeEmailModal}
        >
          <div className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="Novo email do usuário"
              value={changeEmailModal.email}
              onChange={(e) => setChangeEmailModal((prev) => ({ ...prev, email: e.target.value }))}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeChangeEmailModal} disabled={actionLoading}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleChangeEmail}
                disabled={actionLoading || !changeEmailModal.email.trim()}
              >
                {actionLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={changeGlobalRoleModal.isOpen}
          title="Alterar Role Global"
          onClose={closeChangeGlobalRoleModal}
        >
          <div className="space-y-6">
            <Select
              label="Perfil global"
              value={changeGlobalRoleModal.globalRole}
              onChange={(e) => setChangeGlobalRoleModal((prev) => ({ ...prev, globalRole: e.target.value }))}
            >
              <option value="USER">Usuário</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeChangeGlobalRoleModal} disabled={actionLoading}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleChangeGlobalRole}
                disabled={actionLoading || changeGlobalRoleModal.globalRole === user.globalRole}
              >
                {actionLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

export default AdminUserDetails;
