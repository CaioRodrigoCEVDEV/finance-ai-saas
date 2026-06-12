import { useEffect, useState } from 'react';
import { AlertCircle, FolderTree, Plus } from 'lucide-react';

import CategoryCard from '../components/categories/CategoryCard';
import CategoryForm from '../components/categories/CategoryForm';
import CategoryTypeTabs from '../components/categories/CategoryTypeTabs';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory
} from '../services/categoryService';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [allActiveCategories, setAllActiveCategories] = useState([]);
  const [activeType, setActiveType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  async function loadCategories(selectedType = activeType) {
    try {
      setLoading(true);
      setError('');

      const listParams = selectedType === 'ALL' ? {} : { type: selectedType };
      const [listData, parentData] = await Promise.all([
        getCategories(listParams),
        getCategories({ includeInactive: true })
      ]);

      const parentMap = new Map(parentData.map((category) => [category.id, category.name]));

      setAllActiveCategories(parentData);
      setCategories(
        listData.map((category) => ({
          ...category,
          parentName: category.parentId ? parentMap.get(category.parentId) || null : null
        }))
      );
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessão expirou. Entre novamente para continuar.'
          : 'Não foi possível carregar as categorias agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories(activeType);
  }, [activeType]);

  function handleCreateClick() {
    setSelectedCategory(null);
    setFormVisible(true);
    setError('');
  }

  async function handleEdit(category) {
    try {
      setSaving(true);
      setError('');
      const data = await getCategory(category.id);
      setSelectedCategory(data);
      setFormVisible(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar a categoria para edição.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(payload) {
    try {
      setSaving(true);
      setError('');

      if (selectedCategory) {
        await updateCategory(selectedCategory.id, payload);
      } else {
        await createCategory(payload);
      }

      setFormVisible(false);
      setSelectedCategory(null);
      await loadCategories(activeType);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível salvar a categoria.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(`Deseja realmente excluir a categoria "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await deleteCategory(category.id);

      if (selectedCategory?.id === category.id) {
        setSelectedCategory(null);
        setFormVisible(false);
      }

      await loadCategories(activeType);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível excluir a categoria.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedCategory(null);
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Categorias"
          description="Organize receitas, despesas, transferências e investimentos em uma estrutura clara, com filtros modernos e regras atuais preservadas."
          action={(
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              Nova categoria
            </Button>
          )}
        />

        <Card className="rounded-[28px] p-5">
          <CategoryTypeTabs activeType={activeType} onChange={setActiveType} />
        </Card>

        <div className="space-y-6">
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => <LoadingSkeleton key={item} className="h-64 rounded-[28px]" />)}
              </div>
            ) : null}

            {!loading && error ? (
          <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6 dark:border-rose-800 dark:bg-rose-900/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Falha ao processar categorias</p>
                  <p className="mt-2 text-sm text-rose-700 dark:text-rose-400">{error}</p>
                  </div>
                </div>
              </Card>
            ) : null}

            {!loading && !error && categories.length === 0 ? (
              <EmptyState
                icon={FolderTree}
                title="Nenhuma categoria encontrada"
                description="Ajuste o filtro atual ou crie uma categoria personalizada para este workspace sem alterar as categorias padrão existentes."
                action={<Button onClick={handleCreateClick}>Criar categoria</Button>}
              />
            ) : null}

            {!loading && categories.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : null}
        </div>

        <Modal isOpen={formVisible} title={selectedCategory ? 'Editar categoria' : 'Nova categoria'} onClose={handleCancelForm}>
          <CategoryForm
            category={selectedCategory}
            categories={allActiveCategories}
            loading={saving}
            onCancel={handleCancelForm}
            onSubmit={handleSubmit}
          />
        </Modal>
      </div>
    </AppLayout>
  );
}

export default Categories;
