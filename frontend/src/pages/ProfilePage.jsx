import { Loader2, Save, Shield, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';
import * as profileService from '../services/profileService';
import * as tenantService from '../services/tenantService';

function ProfilePage() {
  const { loadUser, updateTenant } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [workspaceSuccess, setWorkspaceSuccess] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  const isWorkspaceManager = profile?.membership?.role === 'OWNER' || profile?.membership?.role === 'ADMIN';

  async function fetchProfile() {
    try {
      setLoading(true);
      setFetchError('');
      const data = await profileService.getProfile();
      setProfile(data);
      setName(data.user.name);
      setEmail(data.user.email);
      setWorkspaceName(data.tenant.name);
    } catch (error) {
      setFetchError(error.response?.data?.message || 'Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = useCallback(async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      setProfileSaving(true);
      await profileService.updateProfile({ name, email });
      setProfileSuccess('Dados atualizados com sucesso');
      await loadUser();
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setProfileSaving(false);
    }
  }, [name, email, loadUser]);

  const handleUpdatePassword = useCallback(async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não conferem');
      return;
    }

    try {
      setPasswordSaving(true);
      await profileService.updatePassword({ currentPassword, newPassword, confirmPassword });
      setPasswordSuccess('Senha alterada com sucesso');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setPasswordSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleUpdateWorkspace = useCallback(async (event) => {
    event.preventDefault();
    setWorkspaceError('');
    setWorkspaceSuccess('');

    try {
      setWorkspaceSaving(true);
      const data = await tenantService.updateCurrentTenant({ name: workspaceName });
      setProfile((prev) => prev ? { ...prev, tenant: { ...prev.tenant, name: data.tenant.name } } : prev);
      updateTenant({ name: data.tenant.name });
      setWorkspaceSuccess('Workspace atualizado com sucesso');
    } catch (error) {
      setWorkspaceError(error.response?.data?.message || 'Erro ao atualizar workspace');
    } finally {
      setWorkspaceSaving(false);
    }
  }, [workspaceName, updateTenant]);

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Minha conta" description="Gerencie seus dados de acesso e informações do perfil" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <LoadingSkeleton className="h-5 w-48" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
            </Card>
            <Card>
              <LoadingSkeleton className="h-5 w-40" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
              <LoadingSkeleton className="mt-4 h-12 w-full" />
            </Card>
          </div>
          <div>
            <Card>
              <LoadingSkeleton className="h-5 w-36" />
              <LoadingSkeleton className="mt-4 h-8 w-48" />
              <LoadingSkeleton className="mt-4 h-6 w-24" />
              <LoadingSkeleton className="mt-4 h-6 w-20" />
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (fetchError) {
    return (
      <AppLayout>
        <PageHeader title="Minha conta" description="Gerencie seus dados de acesso e informações do perfil" />
        <Card className="mt-6 border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30">
          <p className="text-sm text-rose-700 dark:text-rose-400">{fetchError}</p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Minha conta" description="Gerencie seus dados de acesso e informações do perfil" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Dados pessoais</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Atualize seu nome e e-mail</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                id="name"
                label="Nome"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />

              <Input
                id="email"
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />

              {profileError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
                  {profileError}
                </div>
              ) : null}

              {profileSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                  {profileSuccess}
                </div>
              ) : null}

              <Button type="submit" disabled={profileSaving} size="lg">
                {profileSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar alterações
                  </>
                )}
              </Button>
            </form>
          </Card>

          <Card>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Alterar senha</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Mantenha sua conta segura</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                id="currentPassword"
                label="Senha atual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                autoComplete="current-password"
                required
              />

              <Input
                id="newPassword"
                label="Nova senha"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />

              <Input
                id="confirmPassword"
                label="Confirmar nova senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                required
              />

              {passwordError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
                  {passwordError}
                </div>
              ) : null}

              {passwordSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                  {passwordSuccess}
                </div>
              ) : null}

              <Button type="submit" disabled={passwordSaving} variant="secondary" size="lg">
                {passwordSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar senha'
                )}
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-100">Workspace</h2>

            <div className="space-y-4">
              {isWorkspaceManager ? (
                <form onSubmit={handleUpdateWorkspace} className="space-y-3">
                  <Input
                    id="workspaceName"
                    label="Nome do workspace"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Nome do workspace"
                    required
                  />

                  {workspaceError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
                      {workspaceError}
                    </div>
                  ) : null}

                  {workspaceSuccess ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                      {workspaceSuccess}
                    </div>
                  ) : null}

                  <Button type="submit" disabled={workspaceSaving} size="lg">
                    {workspaceSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Salvar workspace
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Nome do workspace</span>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{profile.tenant.name}</p>
                </div>
              )}

              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Plano</span>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800">
                    {profile.tenant.plan}
                  </span>
                </p>
              </div>

              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Perfil</span>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/60 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600">
                    {profile.membership.role}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default ProfilePage;
