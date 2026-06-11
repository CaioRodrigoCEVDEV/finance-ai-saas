import { createContext, useContext, useEffect, useState } from 'react';

import * as authService from '../services/authService';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const response = await authService.getMe();

      setUser(response.user);
      setTenant(response.tenant);
    } catch (_error) {
      setUser(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await authService.login(email, password);

    setUser(response.user);
    setTenant(response.tenant);

    return response;
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setTenant(null);
    }
  }

  function updateTenant(updates) {
    setTenant((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        loadUser,
        updateTenant,
        user,
        tenant,
        isAuthenticated: Boolean(user && tenant),
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
