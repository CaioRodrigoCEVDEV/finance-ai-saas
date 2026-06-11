import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Download, FileText } from 'lucide-react';

import ReportFilters from '../components/reports/ReportFilters';
import FinancialSummaryReport from '../components/reports/FinancialSummaryReport';
import CategoryReport from '../components/reports/CategoryReport';
import AccountReport from '../components/reports/AccountReport';
import CreditCardReport from '../components/reports/CreditCardReport';
import MonthlyEvolutionReport from '../components/reports/MonthlyEvolutionReport';
import TopExpensesReport from '../components/reports/TopExpensesReport';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { getAccounts } from '../services/accountService';
import { getCategories } from '../services/categoryService';
import { getCreditCards } from '../services/creditCardService';
import {
  exportTransactionsCsv,
  getFinancialSummary,
  getMonthlyEvolution,
  getReportByAccount,
  getReportByCategory,
  getReportByCreditCard,
  getTopExpenses
} from '../services/reportService';

const initialFilters = {
  startDate: '',
  endDate: '',
  accountId: '',
  creditCardId: '',
  categoryId: '',
  type: ''
};

function buildParams(filters) {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params[key] = value;
    }
  });
  return params;
}

function Reports() {
  const hasInitialized = useRef(false);
  const [filters, setFilters] = useState(initialFilters);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categoryReport, setCategoryReport] = useState([]);
  const [accountReport, setAccountReport] = useState([]);
  const [creditCardReport, setCreditCardReport] = useState([]);
  const [monthlyEvolution, setMonthlyEvolution] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  async function loadReferences() {
    const [accountData, categoryData, creditCardData] = await Promise.all([
      getAccounts(),
      getCategories({ includeInactive: false }),
      getCreditCards()
    ]);
    setAccounts(accountData);
    setCategories(categoryData);
    setCreditCards(creditCardData);
  }

  async function loadReports(nextFilters = filters) {
    try {
      setLoading(true);
      setError('');
      const params = buildParams(nextFilters);

      const [summaryData, categoryData, accountData, creditCardData, evolutionData, expensesData] = await Promise.all([
        getFinancialSummary(params),
        getReportByCategory(params),
        getReportByAccount(params),
        getReportByCreditCard(params),
        getMonthlyEvolution(params),
        getTopExpenses(params)
      ]);

      setSummary(summaryData);
      setCategoryReport(categoryData);
      setAccountReport(accountData);
      setCreditCardReport(creditCardData);
      setMonthlyEvolution(evolutionData);
      setTopExpenses(expensesData);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessao expirou. Entre novamente para continuar.'
          : 'Nao foi possivel carregar os relatórios agora. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPageData() {
    try {
      await Promise.all([loadReferences(), loadReports(initialFilters)]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Nao foi possivel carregar os dados da tela de relatórios.');
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleApplyFilters() {
    await loadReports(filters);
  }

  async function handleClearFilters() {
    setFilters(initialFilters);
    await loadReports(initialFilters);
  }

  async function handleExportCsv() {
    try {
      setExporting(true);
      setError('');
      await exportTransactionsCsv(buildParams(filters));
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'Sua sessao expirou. Entre novamente para continuar.'
          : 'Nao foi possivel exportar o CSV agora. Tente novamente em instantes.'
      );
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      handleApplyFilters();
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [filters.startDate, filters.endDate]);

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Relatórios"
          description="Analise sua vida financeira com filtros detalhados."
          action={(
            <Button onClick={handleExportCsv} disabled={exporting} variant="secondary">
              <Download className="h-4 w-4" />
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          )}
        />

        <ReportFilters
          filters={filters}
          accounts={accounts}
          creditCards={creditCards}
          categories={categories}
          onChange={handleFilterChange}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />

        {error ? (
          <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">Falha ao carregar relatórios</p>
                <p className="mt-2 text-sm text-rose-700">{error}</p>
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => loadReports(filters)}>Tentar novamente</Button>
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Resumo do periodo</h2>
            <FinancialSummaryReport data={summary} loading={loading} />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Por categoria</h2>
            <CategoryReport data={categoryReport} loading={loading} />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Por conta</h2>
            <AccountReport data={accountReport} loading={loading} />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Por cartao de credito</h2>
            <CreditCardReport data={creditCardReport} loading={loading} />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Evolucao mensal</h2>
            <MonthlyEvolutionReport data={monthlyEvolution} loading={loading} />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Maiores despesas</h2>
            <TopExpensesReport data={topExpenses} loading={loading} />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

export default Reports;
