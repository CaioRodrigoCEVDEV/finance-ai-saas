import { useEffect, useState } from 'react';

import CategoryCard from '../components/categories/CategoryCard';
import CategoryForm from '../components/categories/CategoryForm';
import CategoryTypeTabs from '../components/categories/CategoryTypeTabs';
import MainLayout from '../layouts/MainLayout';
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
          ? 'Sua sessao expirou. Entre novamente para continuar.'
          : 'Nao foi possivel carregar as categorias agora. Tente novamente em instantes.'
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
      setError(requestError.response?.data?.message || 'Nao foi possivel carregar a categoria para edicao.');
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
      setError(requestError.response?.data?.message || 'Nao foi possivel salvar a categoria.');
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
      setError(requestError.response?.data?.message || 'Nao foi possivel excluir a categoria.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelForm() {
    setFormVisible(false);
    setSelectedCategory(null);
  }

  return (
    <MainLayout>
      <header className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-sm">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.28),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-violet-200">
              Classificacao financeira
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Categorias</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-300">
              Organize receitas, despesas, transferencias e investimentos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateClick}
            className="rounded-2xl bg-violet-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-violet-300"
          >
            Nova categoria
          </button>
        </div>
      </header>

      <main className="py-10">
        <div className="mb-8 rounded-[28px] border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <CategoryTypeTabs activeType={activeType} onChange={setActiveType} />
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            {loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
                <p className="text-lg font-medium text-white">Carregando categorias...</p>
                <p className="mt-2 text-sm text-slate-400">Buscando categorias padrao e personalizadas do tenant autenticado.</p>
              </div>
            ) : null}

            {!loading && error ? (
              <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6">
                <p className="text-lg font-medium text-white">Falha ao processar categorias</p>
                <p className="mt-2 text-sm text-rose-100">{error}</p>
              </div>
            ) : null}

            {!loading && !error && categories.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
                <p className="text-xl font-semibold text-white">Nenhuma categoria encontrada</p>
                <p className="mt-2 text-sm text-slate-400">Ajuste o filtro ou crie uma nova categoria personalizada para este tenant.</p>
              </div>
            ) : null}

            {!loading && categories.length > 0 ? (
              <div className="grid gap-6">
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
          </section>

          <aside>
            {formVisible ? (
              <CategoryForm
                category={selectedCategory}
                categories={allActiveCategories}
                loading={saving}
                onCancel={handleCancelForm}
                onSubmit={handleSubmit}
              />
            ) : (
              <section className="rounded-[32px] border border-dashed border-slate-700 bg-slate-900/50 p-8 text-slate-300">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Painel rapido</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Combine categorias padrao com a estrutura do seu tenant</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Categorias globais ficam visiveis para todos os tenants autenticados, enquanto categorias personalizadas podem ser criadas, editadas e removidas apenas dentro do tenant atual.
                </p>
              </section>
            )}
          </aside>
        </div>
      </main>
    </MainLayout>
  );
}

export default Categories;
