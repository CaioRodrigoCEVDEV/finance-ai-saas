import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import Button from '../components/ui/Button';
import { verifyEmail } from '../services/authService';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  const handleVerify = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setMessage('Link de verificacao invalido. Token ausente.');
      return;
    }

    try {
      const result = await verifyEmail(token);
      setStatus('success');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 'Nao foi possivel verificar seu e-mail.'
      );
    }
  }, [token]);

  useEffect(() => {
    handleVerify();
  }, [handleVerify]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verificando seu e-mail...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-700 dark:bg-slate-800">
        {status === 'success' ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">
              E-mail confirmado!
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {message}
            </p>
            <Link to="/login" className="mt-8 block">
              <Button className="w-full" size="lg">
                Entrar no Finance AI
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30">
              <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h1 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">
              Link invalido ou expirado
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {message}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link to="/login">
                <Button variant="primary" className="w-full" size="lg">
                  Ir para login
                </Button>
              </Link>
              <Link to="/">
                <Button variant="secondary" className="w-full" size="lg">
                  Voltar para inicio
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
