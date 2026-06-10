import { useState } from 'react';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@financeai.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Nao foi possivel entrar agora. Confira seu email e senha e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <main className="mx-auto grid min-h-screen w-full max-w-content items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[32px] border-none bg-emerald-600 p-8 text-white shadow-lg sm:p-10 lg:min-h-[720px] lg:p-12">
          <div className="flex h-full flex-col justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-50">Finance AI</span>
              <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">Controle sua vida financeira com inteligencia</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/90 sm:text-lg">
                Entre para acompanhar saldos, categorias e dashboards em uma experiencia visual pronta para um SaaS financeiro premium.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-5">
                <Sparkles className="h-5 w-5" />
                <p className="mt-4 text-lg font-semibold">Tenant multi-conta</p>
                <p className="mt-2 text-sm text-emerald-50/85">Visualize estrutura autenticada por tenant sem mudar a regra existente.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <LockKeyhole className="h-5 w-5" />
                <p className="mt-4 text-lg font-semibold">Acesso seguro</p>
                <p className="mt-2 text-sm text-emerald-50/85">Fluxo de login preservado com a mesma autenticacao e mesmas rotas.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[32px] p-8 sm:p-10 lg:mx-auto lg:w-full lg:max-w-xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Acessar sistema</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Entre na sua conta</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Use seu usuario para abrir o painel financeiro do tenant atual.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input id="email" label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@financeai.com" autoComplete="email" required />
            <Input id="password" label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="123456" autoComplete="current-password" required />

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            <p className="font-semibold text-slate-700">Credenciais demo</p>
            <p className="mt-2">Email: admin@financeai.com</p>
            <p>Senha: 123456</p>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default Login;
