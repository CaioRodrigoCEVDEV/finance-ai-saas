import { createContext, useCallback, useContext, useState } from 'react';

import * as authService from '../services/authService';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);

      const response = await authService.getMe();

      setUser(response.user);
      setTenant(response.tenant);
    } catch (_error) {
      setUser(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureAuth = useCallback(async () => {
    if (initialized) {
      return;
    }

    await loadUser();
    setInitialized(true);
  }, [initialized, loadUser]);

  async function login(email, password) {
    const response = await authService.login(email, password);

    setUser(response.user);
    setTenant(response.tenant);
    setInitialized(true);

    return response;
  }

  async function register(payload) {
    const response = await authService.register(payload);

    setUser(response.user);
    setTenant(response.tenant);
    setInitialized(true);

    return response;
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setTenant(null);
      setInitialized(false);
    }
  }

  function updateTenant(updates) {
    setTenant((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        register,
        logout,
        loadUser,
        ensureAuth,
        updateTenant,
        user,
        tenant,
        initialized,
        isAuthenticated: Boolean(user && tenant),
        isSuperAdmin: user?.globalRole === 'SUPER_ADMIN',
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export {
  AuthProvider,
  useAuth
};
