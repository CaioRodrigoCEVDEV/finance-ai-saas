import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, Mail, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { resendVerification } from '../services/authService';

function EmailVerificationSent() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  async function handleResend() {
    if (!email) return;

    try {
      setResending(true);
      setError('');
      await resendVerification(email);
      setResent(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Nao foi possivel reenviar o e-mail. Tente novamente.'
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="p-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
              <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h1 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">
              Verifique seu e-mail
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Enviamos um link de confirmacao para{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {email || 'seu e-mail'}
              </strong>
              . Clique no link para ativar sua conta.
            </p>

            {resent ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  E-mail reenviado com sucesso!
                </span>
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={resending}
                onClick={handleResend}
              >
                {resending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Reenviar e-mail
                  </>
                )}
              </Button>

              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full">
                  Ir para login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          O link expira em 24 horas. Verifique tambem a caixa de spam.
        </p>
      </div>
    </div>
  );
}

export default EmailVerificationSent;
