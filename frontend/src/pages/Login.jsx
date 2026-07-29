import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  FileDown,
  Globe,
  Layers,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { resendVerification } from '../services/authService';

function DemoIndicator({ label, value, accent }) {
  return (
    <div className="rounded-2xl bg-white/[0.08] px-4 py-3.5 ring-1 ring-white/10 backdrop-blur-sm">
      <span className="text-xs font-medium uppercase tracking-wider text-emerald-200/70">
        {label}
      </span>
      <p
        className={`mt-1 text-lg font-bold tracking-tight ${accent || 'text-white'}`}
      >
        {value}
      </p>
    </div>
  );
}

function FeatureBullet({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-emerald-50/85">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-200">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {label}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [globalError, setGlobalError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setUnverifiedEmail('');
      setResent(false);
      setGlobalError('');
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      const code = requestError.response?.data?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(email);
        setError(requestError.response?.data?.message);
      } else {
        setError(
          requestError.response?.data?.message ||
            'Não foi possível entrar agora. Confira seu email e senha e tente novamente.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!unverifiedEmail) return;

    try {
      setResending(true);
      setGlobalError('');
      await resendVerification(unverifiedEmail);
      setResent(true);
    } catch (requestError) {
      setGlobalError(
        requestError.response?.data?.message ||
          'Nao foi possivel reenviar o e-mail.'
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-stretch justify-stretch p-0 sm:items-center sm:justify-center sm:px-6 sm:py-8 lg:px-8">
      <div className="grid min-h-full w-full max-w-none overflow-hidden rounded-none bg-white shadow-none sm:min-h-0 sm:max-w-5xl sm:rounded-[36px] sm:shadow-glow lg:grid-cols-[1fr_1.08fr] dark:bg-slate-800 dark:sm:shadow-[0_18px_40px_rgba(0,0,0,0.4)]">
        {/* ── Left: institutional panel ── */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-800 p-8 text-white sm:p-10 lg:flex lg:p-12">
          {/* subtle texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08)_0%,transparent_65%)]" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100 ring-1 ring-white/[0.08]">
              <BarChart3 className="h-3.5 w-3.5" />
              Finance AI
            </span>

            <h1 className="mt-10 max-w-sm text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Seu copiloto financeiro pessoal
            </h1>

            <p className="mt-4 max-w-sm text-base leading-relaxed text-emerald-100/80">
              Controle contas, cartões, transações, metas e orçamentos em um
              painel financeiro premium.
            </p>

            {/* stat cards */}
            <div className="mt-10 grid grid-cols-3 gap-3">
              <DemoIndicator label="Saldo total" value="R$ 42,8k" />
              <DemoIndicator label="Economia" value="+12,4%" accent="text-emerald-200" />
              <DemoIndicator label="Orçamentos" value="7 ativos" />
            </div>

            {/* feature bullets */}
            <div className="mt-10 grid gap-3.5">
              <FeatureBullet icon={BarChart3} label="Dashboard inteligente" />
              <FeatureBullet icon={Layers} label="Seus dados protegidos" />
              <FeatureBullet icon={FileDown} label="Importação CSV/OFX" />
              <FeatureBullet icon={Globe} label="Open Finance em breve" />
            </div>
          </div>

          {/* footer */}
          <p className="relative mt-8 text-xs text-emerald-300/60">
            &copy; {new Date().getFullYear()} Finance AI &mdash; v2.0
          </p>
        </div>

        {/* ── Right: login form ── */}
        <div className="flex items-center pl-[calc(1.5rem+env(safe-area-inset-left))] pr-[calc(1.5rem+env(safe-area-inset-right))] pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:px-10 sm:py-12 lg:px-12">
          <div className="w-full">
            {/* mobile-only brand */}
            <div className="mb-8 lg:hidden">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800">
                <BarChart3 className="h-3.5 w-3.5" />
                Finance AI
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                Entre na sua conta
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Acesse seu painel financeiro com segurança.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
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

              <Input
                id="password"
                label="Senha"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                required
              />

              <div className="text-right -mt-3">
                <Link
                  to="/esqueci-senha"
                  className="text-xs font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Esqueci a senha
                </Link>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <p>{error}</p>
                  {unverifiedEmail ? (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={resending}
                        onClick={handleResend}
                        className="text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
                      >
                        {resending ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Reenviando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            Reenviar e-mail de confirmacao
                          </>
                        )}
                      </Button>
                    </div>
                  ) : null}
                  {resent ? (
                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                      E-mail reenviado! Verifique sua caixa de entrada.
                    </p>
                  ) : null}
                  {globalError ? (
                    <p className="mt-2 text-xs text-rose-600">{globalError}</p>
                  ) : null}
                </div>
              ) : null}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* back to landing */}
            <div className="mt-6 text-center space-y-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Criar conta grátis
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar para início
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
