import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';

import FormModal from '../ui/FormModal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

function GenerateTransactionModal({ isOpen, task, accounts, categories, onConfirm, onClose, saving }) {
  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: '',
    accountId: '',
    categoryId: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (task) {
      setForm({
        type: 'EXPENSE',
        amount: task.estimatedAmount ? String(task.estimatedAmount) : '',
        accountId: task.accountId || '',
        categoryId: '',
        description: task.title || '',
        transactionDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [task]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onConfirm({
      type: form.type,
      amount: Number(form.amount),
      accountId: form.accountId,
      categoryId: form.categoryId || undefined,
      description: form.description || undefined,
      transactionDate: form.transactionDate || undefined
    });
  }

  return (
    <FormModal
      isOpen={isOpen}
      eyebrow="GERAR TRANSACAO"
      title="Gerar transacao a partir da tarefa"
      onClose={onClose}
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="generate-transaction-form" disabled={saving}>
            {saving ? 'Gerando...' : 'Gerar transacao'}
          </Button>
        </>
      )}
    >
      <form id="generate-transaction-form" className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="EXPENSE"
              checked={form.type === 'EXPENSE'}
              onChange={handleChange}
              className="h-4 w-4 accent-rose-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Despesa</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="INCOME"
              checked={form.type === 'INCOME'}
              onChange={handleChange}
              className="h-4 w-4 accent-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Receita</span>
          </label>
        </div>

        <Input
          label="Valor"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={handleChange}
          icon={DollarSign}
        />

        <Select label="Conta" name="accountId" value={form.accountId} onChange={handleChange}>
          <option value="">Selecione uma conta</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </Select>

        <Select label="Categoria" name="categoryId" value={form.categoryId} onChange={handleChange}>
          <option value="">Nenhuma</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>

        <Input
          label="Descricao"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <Input
          label="Data"
          name="transactionDate"
          type="date"
          value={form.transactionDate}
          onChange={handleChange}
        />
      </form>
    </FormModal>
  );
}

export default GenerateTransactionModal;
