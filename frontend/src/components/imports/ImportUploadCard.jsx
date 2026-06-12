import { useRef, useState } from 'react';
import { FileUp, UploadCloud } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

function ImportUploadCard({
  accounts,
  creditCards,
  onPreview,
  loading
}) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [accountId, setAccountId] = useState('');
  const [creditCardId, setCreditCardId] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (accountId) formData.append('accountId', accountId);
    if (creditCardId) formData.append('creditCardId', creditCardId);

    onPreview(formData);
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Select
            label="Conta (opcional)"
            value={accountId}
            onChange={(e) => { setAccountId(e.target.value); setCreditCardId(''); }}
          >
            <option value="">Selecione uma conta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>

          <Select
            label="Cartão de crédito (opcional)"
            value={creditCardId}
            onChange={(e) => { setCreditCardId(e.target.value); setAccountId(''); }}
          >
            <option value="">Selecione um cartão</option>
            {creditCards.map((card) => (
              <option key={card.id} value={card.id}>{card.name}</option>
            ))}
          </Select>
        </div>

        <div
          className={`flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-6 py-10 transition ${
            dragOver             ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20' : 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
            <UploadCloud className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {file ? file.name : 'Arraste um arquivo CSV ou OFX aqui'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Ou clique para selecionar'}
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.ofx"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tamanho maximo: 5MB. Formatos: CSV, OFX.
          </p>
          <Button type="submit" disabled={!file || loading}>
            <FileUp className="h-4 w-4" />
            {loading ? 'Processando...' : 'Pre-visualizar'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default ImportUploadCard;
