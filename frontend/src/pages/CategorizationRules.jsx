import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Play, Plus, Sparkles, Wand2 } from 'lucide-react';

import ApplyRulesModal from '../components/categorizationRules/ApplyRulesModal';
import CategorizationRuleCard from '../components/categorizationRules/CategorizationRuleCard';
import CategorizationRuleForm from '../components/categorizationRules/CategorizationRuleForm';
import CategorizationRuleTester from '../components/categorizationRules/CategorizationRuleTester';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import {
  createCategorizationRule,
  deleteCategorizationRule,
  getCategorizationRule,
  getCategorizationRules,
  updateCategorizationRule
} from '../services/categorizationRuleService';

function CategorizationRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [applyVisible, setApplyVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [search, setSearch] = useState('');

  async function loadRules() {
    try {
      setLoading(true);
      setError('');
      const data = await getCategorizationRules();
      setRules(data);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : 'Não foi possível carregar as regras agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  const filteredRules = useMemo(() => {
    if (!search.trim()) return rules;
    const term = search.trim().toUpperCase();
    return rules.filter(
      (r) =>
        r.name.toUpperCase().includes(term) ||
        r.matchText.toUpperCase().includes(term)
    );
  }, [rules, search]);

  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter((r) => r.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [rules]);

  function handleCreateClick() {
    setSelectedRule(null);
    setFormVisible(true);
    setError('');
  }

  async function handleEdit(rule) {
    try {
      setSaving(true);
      setError('');
      const data = await getCategorizationRule(rule.id);
      setSelectedRule(data);
      setFormVisible(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar a regra para edição.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');

      if (selectedRule) {
        await updateCategorizationRule(selectedRule.id, payload);
      } else {
        await createCategorizationRule(payload);
      }

      setFormVisible(false);
      setSelectedRule(null);
      await loadRules();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível salvar a regra.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(rule) {
    const confirmed = window.confirm(`Deseja realmente excluir a regra "${rule.name}"?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      await deleteCategorizationRule(rule.id);

      if (selectedRule?.id === rule.id) {
        setSelectedRule(null);
        setFormVisible(false);
      }

      await loadRules();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível excluir a regra.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedRule(null);
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Regras de categorização"
          description="Automatize a classificação dos seus gastos por descrição."
          action={(
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setApplyVisible(true)}>
                <Play className="h-4 w-4" />
                Aplicar em transações
              </Button>
              <Button onClick={handleCreateClick}>
                <Plus className="h-4 w-4" />
                Nova regra
              </Button>
            </div>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Card className="rounded-[28px] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total de regras</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-[28px] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Regras ativas</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.active}</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-[28px] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Regras inativas</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.inactive}</p>
              </div>
            </div>
          </Card>
        </div>

        <CategorizationRuleTester />

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar regras..."
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <LoadingSkeleton key={item} className="h-40 rounded-[28px]" />
              ))}
            </div>
          ) : null}

          {!loading && error ? (
            <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900">Falha ao processar regras</p>
                  <p className="mt-2 text-sm text-rose-700">{error}</p>
                </div>
              </div>
            </Card>
          ) : null}

          {!loading && !error && filteredRules.length === 0 ? (
            <EmptyState
              icon={Wand2}
              title="Nenhuma regra encontrada"
              description="Crie sua primeira regra de categorização automatica para agilizar a classificação de transações."
              action={<Button onClick={handleCreateClick}>Criar regra</Button>}
            />
          ) : null}

          {!loading && filteredRules.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredRules.map((rule) => (
                <CategorizationRuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : null}
        </div>

        <Modal
          isOpen={formVisible}
          title={selectedRule ? 'Editar regra' : 'Nova regra'}
          onClose={handleCancelForm}
        >
          <CategorizationRuleForm
            rule={selectedRule}
            loading={saving}
            onCancel={handleCancelForm}
            onSubmit={handleSubmit}
          />
        </Modal>

        <ApplyRulesModal isOpen={applyVisible} onClose={() => setApplyVisible(false)} />
      </div>
    </AppLayout>
  );
}

export default CategorizationRules;
