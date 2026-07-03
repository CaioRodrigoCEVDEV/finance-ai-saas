import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { forgotPassword } from '../services/authService';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      const result = await forgotPassword(email);
      setSent(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Nao foi possivel processar sua solicitacao. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <Card className="p-8 sm:p-10">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">
                E-mail enviado!
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Se o e-mail estiver cadastrado, voce recebera um link de
                recuperacao em instantes.
              </p>
              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Nao esqueça de verificar a caixa de spam.
              </p>
              <Link to="/login" className="mt-8 block">
                <Button variant="primary" className="w-full" size="lg">
                  Voltar para login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Card className="p-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
              <Mail className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>

            <h1 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">
              Recuperar senha
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar link de recuperacao
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar para login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;
