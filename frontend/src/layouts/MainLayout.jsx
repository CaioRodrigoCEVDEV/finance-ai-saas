import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/accounts', label: 'Contas' },
  { to: '/categories', label: 'Categorias' }
];

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, tenant, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <nav className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-900/75 px-5 py-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/dashboard" className="mr-2 text-lg font-semibold tracking-tight text-white">
              Finance AI
            </Link>

            {navigationItems.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-sky-500 text-slate-950' : 'border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <div className="text-sm text-slate-400 sm:text-right">
              <p className="font-semibold text-white">{user?.name || 'Usuário autenticado'}</p>
              <p>{tenant?.name || 'Finance AI'}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-slate-700 px-4 py-2 font-medium text-white transition hover:border-sky-400 hover:text-sky-300"
            >
              Sair
            </button>
          </div>
        </nav>

        {children}
      </div>
    </div>
  );
}

export default MainLayout;
