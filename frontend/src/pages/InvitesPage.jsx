import { useEffect, useState } from 'react';
import {
  Copy,
  ExternalLink,
  Gift,
  Link,
  Plus,
  Power,
  PowerOff,
  Trash2
} from 'lucide-react';

import AppLayout from '../layouts/AppLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PageHeader from '../components/ui/PageHeader';
import Select from '../components/ui/Select';
import {
  listInvites,
  createInvite,
  updateInviteStatus,
  deleteInvite
} from '../services/inviteService';

const STATUS_MAP = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  DISABLED: { label: 'Desativado', variant: 'neutral' },
  EXPIRED: { label: 'Expirado', variant: 'warning' }
};

const DESTINATION_LABELS = {
  '/': 'Landing page',
  '/plans': 'Planos',
  '/checkout': 'Checkout'
};

function getDestinationLabel(value) {
  return DESTINATION_LABELS[value] || value;
}

function InvitesPage() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [targetPath, setTargetPath] = useState('/');
  const [generating, setGenerating] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  async function loadInvites() {
    try {
      setLoading(true);
      setError('');
      const data = await listInvites();
      setInvites(data);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Sua sessão expirou. Faça login novamente.' : 'Não foi possível carregar os convites.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvites();
  }, []);

  async function handleCreateInvite(e) {
    e.preventDefault();
    try {
      setGenerating(true);
      setError('');
      const payload = {};
      if (title.trim()) payload.title = title.trim();
      payload.targetPath = targetPath;
      const invite = await createInvite(payload);
      setGeneratedInvite(invite);
      setTitle('');
      setTargetPath('/');
      setInvites((prev) => [invite, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao gerar convite');
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggleStatus(invite) {
    try {
      const newStatus = invite.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      const updated = await updateInviteStatus(invite.id, newStatus);
      setInvites((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar status');
    }
  }

  async function handleDelete(invite) {
    if (!window.confirm(`Deseja excluir o convite "${invite.title || invite.code}"?`)) {
      return;
    }
    try {
      await deleteInvite(invite.id);
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      if (generatedInvite?.id === invite.id) {
        setGeneratedInvite(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir convite');
    }
  }

  async function handleCopy(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback silently
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Convites"
          description="Compartilhe o Finance AI com outras pessoas e acompanhe seus acessos."
        />

        {error && (
          <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
            {error}
          </Card>
        )}

        <Card className="rounded-[28px]">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Gift className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Novo link de convite</h2>
          </div>
          <form onSubmit={handleCreateInvite} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nome do convite <span className="text-slate-400">(opcional)</span>
              </label>
              <Input
                placeholder="Ex: Convite para amigos"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Destino
              </label>
              <Select
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
              >
                <option value="/">Landing page</option>
                <option value="/plans" disabled>Planos (em breve)</option>
                <option value="/checkout" disabled>Checkout (em breve)</option>
              </Select>
            </div>
            <Button type="submit" disabled={generating} className="shrink-0">
              <Plus className="h-4 w-4" />
              {generating ? 'Gerando...' : 'Gerar convite'}
            </Button>
          </form>

          {generatedInvite && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-3">
                Convite gerado com sucesso!
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <code className="flex-1 break-all rounded-xl bg-white px-4 py-2.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {generatedInvite.inviteUrl}
                </code>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(generatedInvite.inviteUrl, `generated-${generatedInvite.id}`)}
                  >
                    <Copy className="h-4 w-4" />
                    {copiedId === `generated-${generatedInvite.id}` ? 'Copiado' : 'Copiar'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(generatedInvite.inviteUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {loading && (
          <Card className="rounded-[28px] p-8 space-y-4">
            <LoadingSkeleton className="h-6 w-48" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-4 w-5/6" />
          </Card>
        )}

        {!loading && !error && invites.length === 0 && (
          <EmptyState
            icon={Gift}
            title="Nenhum convite criado"
            description="Gere seu primeiro link para compartilhar o Finance AI."
            action={
              <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Gerar primeiro convite
              </Button>
            }
          />
        )}

        {!loading && invites.length > 0 && (
          <Card className="rounded-[28px] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Meus convites</h2>
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Codigo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Destino</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cliques</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cadastros</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ultimo clique</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {invites.map((invite) => {
                    const status = STATUS_MAP[invite.status] || STATUS_MAP.EXPIRED;
                    return (
                      <tr key={invite.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                          {invite.title || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1">
                            {invite.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {getDestinationLabel(invite.targetPath)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-900 dark:text-slate-100">
                          {invite.clicks}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                          {invite.signups}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(invite.lastClickAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(invite.inviteUrl, invite.id)}
                              title="Copiar link"
                            >
                              <Copy className="h-4 w-4" />
                              {copiedId === invite.id && <span className="ml-1 text-xs">Copiado</span>}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(invite.inviteUrl, '_blank')}
                              title="Abrir link"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(invite)}
                              title={invite.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                            >
                              {invite.status === 'ACTIVE' ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(invite)}
                              title="Excluir"
                              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-700">
              {invites.map((invite) => {
                const status = STATUS_MAP[invite.status] || STATUS_MAP.EXPIRED;
                return (
                  <div key={invite.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">
                          {invite.title || invite.code}
                        </p>
                        <code className="text-xs text-slate-500 dark:text-slate-400 break-all">{invite.code}</code>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Destino: </span>
                        <span className="text-slate-900 dark:text-slate-100">{getDestinationLabel(invite.targetPath)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Cliques: </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{invite.clicks}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Cadastros: </span>
                        <span className="text-slate-900 dark:text-slate-100">{invite.signups}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Ultimo clique: </span>
                        <span className="text-slate-900 dark:text-slate-100">{formatDate(invite.lastClickAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(invite.inviteUrl, invite.id)}
                      >
                        <Copy className="h-4 w-4" />
                        {copiedId === invite.id ? ' Copiado' : ' Copiar'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(invite.inviteUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Abrir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(invite)}
                      >
                        {invite.status === 'ACTIVE' ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(invite)}
                        className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export default InvitesPage;
