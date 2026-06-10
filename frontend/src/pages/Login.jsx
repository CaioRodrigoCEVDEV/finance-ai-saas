import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';

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
    <MainLayout>
      <main className="flex flex-1 items-center justify-center py-10">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/70 shadow-2xl shadow-slate-950/40 backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between border-b border-slate-800 p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div>
              <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-brand-400">
                Finance AI
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">Acesse seu copiloto financeiro pessoal</h1>
              <p className="mt-4 max-w-xl text-base text-slate-300 md:text-lg">
                Entre com sua conta para visualizar o tenant ativo, seus indicadores e o dashboard em tempo real.
              </p>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-300">
              <p className="font-medium text-white">Acesso demo</p>
              <p className="mt-2">Email: admin@financeai.com</p>
              <p>Senha: 123456</p>
            </div>
          </div>

          <div className="p-8 lg:p-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400"
                  placeholder="admin@financeai.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="password">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-400"
                  placeholder="123456"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </MainLayout>
  );
}

export default Login;
