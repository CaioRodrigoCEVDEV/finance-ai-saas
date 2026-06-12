import { useEffect, useState } from 'react';
import { AlertCircle, FileUp } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import ImportPreviewTable from '../components/imports/ImportPreviewTable';
import ImportSummary from '../components/imports/ImportSummary';
import ImportUploadCard from '../components/imports/ImportUploadCard';
import { getAccounts } from '../services/accountService';
import { getCategories } from '../services/categoryService';
import { getCreditCards } from '../services/creditCardService';
import { confirmImport, previewImport } from '../services/importService';

function Imports() {
  const [accounts, setAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCreditCardId, setSelectedCreditCardId] = useState('');

  async function loadReferences() {
    try {
      const [accountData, categoryData, creditCardData] = await Promise.all([
        getAccounts(),
        getCategories({ includeInactive: false }),
        getCreditCards()
      ]);
      setAccounts(accountData);
      setCategories(categoryData);
      setCreditCards(creditCardData);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível carregar os dados de referencia.');
    }
  }

  useEffect(() => {
    loadReferences();
  }, []);

  async function handlePreview(formData) {
    try {
      setLoading(true);
      setError('');
      setPreview(null);
      setResult(null);
      const data = await previewImport(formData);
      setPreview(data);
      // Keep selected account/credit card from the form
      const acc = formData.get('accountId');
      const cc = formData.get('creditCardId');
      setSelectedAccountId(acc || '');
      setSelectedCreditCardId(cc || '');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Não foi possível processar o arquivo. Verifique o formato e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    try {
      setLoading(true);
      setError('');

      const validTransactions = (preview?.transactions || []).filter((t) => t.isValid !== false);
      if (validTransactions.length === 0) {
        setError('Não há transações válidas para confirmar.');
        setLoading(false);
        return;
      }

      const payload = {
        accountId: selectedAccountId || null,
        creditCardId: selectedCreditCardId || null,
        source: preview.transactions[0]?.source || 'CSV',
        transactions: validTransactions.map((t) => ({
          externalId: t.externalId || null,
          description: t.description,
          amount: t.amount,
          type: t.type,
          transactionDate: t.transactionDate,
          paymentMethod: t.paymentMethod || 'OTHER',
          categoryId: t.categoryId || t.suggestedCategoryId || null,
          status: t.status || 'CONFIRMED',
          notes: t.notes || null
        }))
      };

      const data = await confirmImport(payload);
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível confirmar a importação.');
    } finally {
      setLoading(false);
    }
  }

  function handlePreviewChange(nextTransactions) {
    setPreview((prev) => (prev ? { ...prev, transactions: nextTransactions } : null));
  }

  function handleRemove(index) {
    setPreview((prev) => {
      if (!prev) return null;
      const next = [...prev.transactions];
      next.splice(index, 1);
      return {
        ...prev,
        totalRows: next.length,
        validRows: next.filter((t) => t.isValid !== false).length,
        invalidRows: next.filter((t) => t.isValid === false).length,
        transactions: next
      };
    });
  }

  function handleReset() {
    setPreview(null);
    setResult(null);
    setError('');
    setSelectedAccountId('');
    setSelectedCreditCardId('');
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Importação de extratos"
          description="Importe arquivos CSV ou OFX e revise antes de salvar."
          action={(
            <Button variant="secondary" onClick={handleReset}>
              <FileUp className="h-4 w-4" />
              Novo import
            </Button>
          )}
        />

        {error && (
          <Card className="rounded-[28px] border-rose-200 bg-rose-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">Falha ao processar importação</p>
                <p className="mt-2 text-sm text-rose-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {!preview && !result && (
          <ImportUploadCard
            accounts={accounts}
            creditCards={creditCards}
            onPreview={handlePreview}
            loading={loading}
          />
        )}

        {!result && preview && (
          <ImportPreviewTable
            preview={preview}
            categories={categories}
            onChange={handlePreviewChange}
            onRemove={handleRemove}
            onConfirm={handleConfirm}
            loading={loading}
          />
        )}

        {result && (
          <ImportSummary result={result} onReset={handleReset} />
        )}
      </div>
    </AppLayout>
  );
}

export default Imports;
