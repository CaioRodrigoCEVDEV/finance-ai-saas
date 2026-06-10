import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

function ImportSummary({ result, onReset }) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <XCircle className="h-6 w-6" />
        </div>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">Importacao concluida</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {result.message}
      </p>
      <div className="mt-6 grid w-full max-w-xs gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-2xl font-semibold text-emerald-700">{result.created}</p>
          <p className="text-sm text-emerald-700">Criada(s)</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-2xl font-semibold text-rose-700">{result.skipped}</p>
          <p className="text-sm text-rose-700">Ignorada(s)</p>
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={onReset}>Importar outro arquivo</Button>
      </div>
    </Card>
  );
}

export default ImportSummary;
