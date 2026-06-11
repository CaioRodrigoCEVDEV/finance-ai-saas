import { Camera, Loader2, Save, Shield, Trash2, User, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';

import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';
import * as profileService from '../services/profileService';
import * as tenantService from '../services/tenantService';

const API_URL = import.meta.env.VITE_API_URL;

function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
  });
}

function CropModal({ image, open, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      await onSave(croppedBlob);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ajustar foto</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative h-80 w-full bg-slate-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
          />
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar foto'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { loadUser, user: authUser, updateTenant } = useAuth();

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

  const [cropImage, setCropImage] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const fileInputRef = useRef(null);

  const isWorkspaceManager = profile?.membership?.role === 'OWNER' || profile?.membership?.role === 'ADMIN';
  const currentAvatarUrl = profile?.user?.avatar_url || authUser?.avatar_url;

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

  function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  }

  async function handleCropSave(croppedBlob) {
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const result = await profileService.uploadAvatar(croppedBlob);
      setProfile((prev) => prev ? { ...prev, user: { ...prev.user, avatar_url: result.avatar_url } } : prev);
      await loadUser();
    } catch (error) {
      setAvatarError(error.response?.data?.message || 'Erro ao enviar foto');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    setAvatarError('');
    setAvatarUploading(true);
    try {
      await profileService.removeAvatar();
      setProfile((prev) => prev ? { ...prev, user: { ...prev.user, avatar_url: null } } : prev);
      await loadUser();
    } catch (error) {
      setAvatarError(error.response?.data?.message || 'Erro ao remover foto');
    } finally {
      setAvatarUploading(false);
    }
  }

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

      <CropModal
        image={cropImage}
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onSave={handleCropSave}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

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

            <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-2xl font-semibold text-emerald-700 overflow-hidden dark:bg-emerald-900/30 dark:text-emerald-400">
                {currentAvatarUrl ? (
                  <img
                    src={`${API_URL}${currentAvatarUrl}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(profile?.user?.name)
                )}
              </div>
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{profile?.user?.name}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-1.5 h-3.5 w-3.5" />
                        Alterar foto
                      </>
                    )}
                  </Button>
                  {currentAvatarUrl ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={avatarUploading}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Remover foto
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {avatarError ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
                {avatarError}
              </div>
            ) : null}

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
