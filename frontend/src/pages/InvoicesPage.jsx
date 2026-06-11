import {
  AlertCircle,
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  TrendingDown,
  WalletCards,
  XCircle
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import * as invoiceService from '../services/invoiceService';
import { getCreditCards } from '../services/creditCardService';
import { getAccounts } from '../services/accountService';
import { formatCurrencyBRL, formatDateBR } from '../utils/formatters';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Select from '../components/ui/Select';

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

const STATUS_CONFIG = {
  OPEN: { label: 'Aberta', variant: 'neutral' },
  CLOSED: { label: 'Fechada', variant: 'info' },
  PAID: { label: 'Paga', variant: 'success' },
  OVERDUE: { label: 'Vencida', variant: 'danger' },
  PARTIAL: { label: 'Parcial', variant: 'warning' }
};

function InvoiceBadge({ status, effectiveStatus }) {
  const s = effectiveStatus || status;
  const config = STATUS_CONFIG[s] || STATUS_CONFIG.OPEN;
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

function SummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-28 rounded-[28px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <DollarSign className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total em aberto</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrencyBRL(summary?.totalOpen || 0)}
          </p>
        </div>
      </Card>

      <Card className="flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
          <Calendar className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Próximo vencimento</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {summary?.nextDue ? formatDateBR(summary.nextDue) : '--'}
          </p>
        </div>
      </Card>

      <Card className="flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pagas este mês</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {summary?.paidThisMonth ?? 0}
          </p>
        </div>
      </Card>

      <Card className="flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
          <AlertCircle className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Faturas vencidas</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {summary?.overdueCount ?? 0}
          </p>
        </div>
      </Card>
    </div>
  );
}

function PaymentModal({ isOpen, invoice, onClose, onPaid }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    accountId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    notes: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setForm({
      accountId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      amount: invoice?.totalAmount?.toString() || '',
      notes: ''
    });
    setLoading(true);
    getAccounts()
      .then((data) => {
        const active = (data?.accounts || data || []).filter((a) => a.isActive !== false);
        setAccounts(active);
      })
      .catch(() => setError('Erro ao carregar contas'))
      .finally(() => setLoading(false));
  }, [isOpen, invoice?.totalAmount]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.accountId) {
      setError('Selecione uma conta de pagamento');
      return;
    }
    if (!form.paymentDate) {
      setError('Informe a data de pagamento');
      return;
    }

    setSaving(true);
    try {
      await invoiceService.payInvoice(invoice.id, {
        accountId: form.accountId,
        paymentDate: form.paymentDate,
        amount: invoice?.totalAmount
      });
      onPaid();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao pagar fatura');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} title="Pagar fatura" onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Cartão</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{invoice?.creditCard?.name}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Referência</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{invoice?.referenceLabel}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Valor total</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(invoice?.totalAmount)}</p>
          </div>

          <Select
            label="Conta de pagamento"
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            required
          >
            <option value="">Selecione uma conta</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({formatCurrencyBRL(acc.currentBalance)})
              </option>
            ))}
          </Select>

          <Input
            label="Data de pagamento"
            type="date"
            value={form.paymentDate}
            onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Banknote className="mr-2 h-4 w-4" />}
              Confirmar pagamento
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function InvoiceDetailModal({ isOpen, invoiceId, onClose, onRecalculate, onPay }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !invoiceId) return;
    setLoading(true);
    setError('');
    invoiceService.getInvoice(invoiceId)
      .then(setDetail)
      .catch((err) => setError(err?.response?.data?.message || 'Erro ao carregar detalhes'))
      .finally(() => setLoading(false));
  }, [isOpen, invoiceId]);

  if (!isOpen) return null;

  const inv = detail?.invoice;
  const summary = detail?.summary;
  const status = inv?.effectiveStatus || inv?.status;

  return (
    <Modal isOpen={isOpen} title="Detalhes da fatura" onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
          {error}
        </div>
      ) : inv ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Cartão</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{inv.creditCard?.name}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Referência</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{inv.referenceLabel}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Período</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {formatDateBR(inv.periodStart)} - {formatDateBR(inv.periodEnd)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Fechamento</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{formatDateBR(inv.closingDate)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Vencimento</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{formatDateBR(inv.dueDate)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <InvoiceBadge status={inv.status} effectiveStatus={status} />
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(summary?.totalAmount)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Pago</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {status === 'PAID' ? formatCurrencyBRL(summary?.paidAmount) : '--'}
              </p>
            </div>
          </div>

          {status === 'PAID' && inv.paymentAccount && (
            <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">Pagamento realizado</p>
              <p className="font-medium text-emerald-900 dark:text-emerald-300">
                Conta: {inv.paymentAccount.name} em {formatDateBR(inv.paidAt)}
              </p>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Compras da fatura ({summary?.transactionCount ?? 0})
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Data</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Descrição</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Categoria</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Valor</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail?.transactions?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                        Nenhuma compra nesta fatura
                      </td>
                    </tr>
                  ) : (
                    detail?.transactions?.map((t) => (
                      <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700/50">
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{formatDateBR(t.date)}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{t.description}</td>
                        <td className="px-4 py-3">
                          {t.category ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{ backgroundColor: t.category.color ? `${t.category.color}20` : undefined, color: t.category.color || undefined }}
                            >
                              {t.category.name}
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 font-medium ${t.type === 'EXPENSE' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {t.type === 'EXPENSE' ? '-' : '+'}{formatCurrencyBRL(t.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            t.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            t.status === 'PENDING' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {t.status === 'CONFIRMED' ? 'Confirmada' : t.status === 'PENDING' ? 'Pendente' : t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {status !== 'PAID' && (
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { onRecalculate(inv.id); onClose(); }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recalcular
              </Button>
              <Button onClick={() => { onPay(inv); onClose(); }}>
                <Banknote className="mr-2 h-4 w-4" />
                Pagar
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}

function InvoiceRow({ invoice, onView, onRecalculate, onPay, onCancel, canWrite }) {
  const status = invoice.effectiveStatus || invoice.status;

  return (
    <>
      {/* Desktop row */}
      <tr className="hidden border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 sm:table-row">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: invoice.creditCard?.color ? `${invoice.creditCard.color}20` : undefined }}>
              <CreditCard className="h-4 w-4" style={{ color: invoice.creditCard?.color || undefined }} />
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{invoice.creditCard?.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{invoice.referenceLabel}</td>
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
          {formatDateBR(invoice.periodStart)} - {formatDateBR(invoice.periodEnd)}
        </td>
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{formatDateBR(invoice.closingDate)}</td>
        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{formatDateBR(invoice.dueDate)}</td>
        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
          {formatCurrencyBRL(invoice.totalAmount)}
        </td>
        <td className="px-4 py-3">
          <InvoiceBadge status={invoice.status} effectiveStatus={status} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onView(invoice.id)} title="Ver detalhes">
              <FileText className="h-4 w-4" />
            </Button>
            {canWrite && status !== 'PAID' && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onRecalculate(invoice.id)} title="Recalcular">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onPay(invoice)} title="Pagar">
                  <Banknote className="h-4 w-4" />
                </Button>
              </>
            )}
            {canWrite && status === 'PAID' && (
              <Button variant="ghost" size="sm" onClick={() => onCancel(invoice.id)} title="Cancelar pagamento">
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </td>
      </tr>

      {/* Mobile card */}
      <tr className="sm:hidden">
        <td colSpan={8} className="p-2">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: invoice.creditCard?.color ? `${invoice.creditCard.color}20` : undefined }}>
                  <CreditCard className="h-4 w-4" style={{ color: invoice.creditCard?.color || undefined }} />
                </span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{invoice.creditCard?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{invoice.referenceLabel}</p>
                </div>
              </div>
              <InvoiceBadge status={invoice.status} effectiveStatus={status} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Período</span>
                <p className="text-slate-700 dark:text-slate-300">{formatDateBR(invoice.periodStart)} - {formatDateBR(invoice.periodEnd)}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Fechamento</span>
                <p className="text-slate-700 dark:text-slate-300">{formatDateBR(invoice.closingDate)}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Vencimento</span>
                <p className="text-slate-700 dark:text-slate-300">{formatDateBR(invoice.dueDate)}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Total</span>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrencyBRL(invoice.totalAmount)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-slate-700/50">
              <Button variant="ghost" size="sm" onClick={() => onView(invoice.id)}>
                <FileText className="mr-1 h-4 w-4" />
                Detalhes
              </Button>
              {canWrite && status !== 'PAID' && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onRecalculate(invoice.id)}>
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Recalcular
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onPay(invoice)}>
                    <Banknote className="mr-1 h-4 w-4" />
                    Pagar
                  </Button>
                </>
              )}
              {canWrite && status === 'PAID' && (
                <Button variant="ghost" size="sm" onClick={() => onCancel(invoice.id)}>
                  <XCircle className="mr-1 h-4 w-4" />
                  Cancelar
                </Button>
              )}
            </div>
          </Card>
        </td>
      </tr>
    </>
  );
}

function InvoicesPage() {
  const { tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const canWrite = tenant?.role !== 'READONLY';

  const [cards, setCards] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const initialized = useRef(false);

  const [creditCardId, setCreditCardId] = useState(searchParams.get('creditCardId') || '');
  const currentDate = new Date();
  const [month, setMonth] = useState(searchParams.get('month') ? parseInt(searchParams.get('month'), 10) : currentDate.getMonth() + 1);
  const [year, setYear] = useState(searchParams.get('year') ? parseInt(searchParams.get('year'), 10) : currentDate.getFullYear());

  const [detailInvoiceId, setDetailInvoiceId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState(null);
  const [payOpen, setPayOpen] = useState(false);

  async function loadSummary() {
    try {
      const data = await invoiceService.getInvoiceSummary();
      setSummary(data);
    } catch {
      // summary failure is non-blocking
    } finally {
      setSummaryLoading(false);
    }
  }

  const loadInvoices = useCallback(async () => {
    try {
      setError('');
      const params = {};
      if (creditCardId) params.creditCardId = creditCardId;
      params.month = month;
      params.year = year;

      const data = await invoiceService.listInvoices(params);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao carregar faturas');
    } finally {
      setLoading(false);
    }
  }, [creditCardId, month, year]);

  useEffect(() => {
    initialized.current = true;
    loadSummary();
    getCreditCards()
      .then((data) => setCards(data?.creditCards || data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    setLoading(true);
    loadInvoices();
  }, [loadInvoices]);

  async function handleGenerate() {
    if (!creditCardId) return;
    setLoading(true);
    setError('');
    try {
      await invoiceService.generateInvoice({ creditCardId, referenceMonth: month, referenceYear: year });
      await loadInvoices();
      await loadSummary();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao gerar fatura');
      setLoading(false);
    }
  }

  async function handleRecalculate(invoiceId) {
    try {
      await invoiceService.recalculateInvoice(invoiceId);
      await loadInvoices();
      if (detailOpen) {
        setDetailOpen(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao recalcular fatura');
    }
  }

  async function handleCancelPayment(invoiceId) {
    try {
      await invoiceService.cancelInvoicePayment(invoiceId);
      await loadInvoices();
      await loadSummary();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao cancelar pagamento');
    }
  }

  function handleView(invoiceId) {
    setDetailInvoiceId(invoiceId);
    setDetailOpen(true);
  }

  function handlePay(invoice) {
    setPayInvoice(invoice);
    setPayOpen(true);
  }

  function handlePaid() {
    loadInvoices();
    loadSummary();
  }

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        <PageHeader
          title="Faturas de cartão"
          description="Acompanhe fechamento, vencimento e pagamento das suas faturas."
          action={
            <div className="flex flex-wrap items-center gap-2">
              {canWrite && (
                <Button onClick={handleGenerate} disabled={!creditCardId || loading}>
                  <WalletCards className="mr-2 h-4 w-4" />
                  Gerar fatura
                </Button>
              )}
            </div>
          }
        />

        <SummaryCards summary={summary} loading={summaryLoading} />

        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-56">
              <Select
                label="Cartão"
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
              >
                <option value="">Todos os cartões</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>{card.name}</option>
                ))}
              </Select>
            </div>

            <div className="flex items-end gap-1">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="w-32">
                <Select
                  label="Mês"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
              <div className="w-24">
                <Input
                  label="Ano"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10) || currentDate.getFullYear())}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {!loading && (
              <Button variant="ghost" size="sm" onClick={loadInvoices}>
                <RefreshCw className="mr-1 h-4 w-4" />
                Atualizar
              </Button>
            )}
          </div>
        </Card>

        {error && (
          <Card className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/30">
            <div className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          </Card>
        )}

        {loading ? (
          <Card className="p-6">
            <LoadingSkeleton className="h-64 rounded-[28px]" />
          </Card>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Nenhuma fatura encontrada"
            description="Gere faturas a partir dos seus cartões de crédito para acompanhar vencimentos e pagamentos."
            action={
              canWrite && creditCardId ? (
                <Button onClick={handleGenerate}>
                  Gerar fatura
                </Button>
              ) : null
            }
          />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Cartão</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Referência</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Período</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Fechamento</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Vencimento</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Total</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <InvoiceRow
                      key={inv.id}
                      invoice={inv}
                      onView={handleView}
                      onRecalculate={handleRecalculate}
                      onPay={handlePay}
                      onCancel={handleCancelPayment}
                      canWrite={canWrite}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <InvoiceDetailModal
          isOpen={detailOpen}
          invoiceId={detailInvoiceId}
          onClose={() => setDetailOpen(false)}
          onRecalculate={handleRecalculate}
          onPay={handlePay}
        />

        <PaymentModal
          isOpen={payOpen}
          invoice={payInvoice}
          onClose={() => setPayOpen(false)}
          onPaid={handlePaid}
        />
      </div>
    </AppLayout>
  );
}

export default InvoicesPage;
