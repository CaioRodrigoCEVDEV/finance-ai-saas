import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import Accounts from '../pages/Accounts';
import Categories from '../pages/Categories';
import Dashboard from '../pages/Dashboard';
import HomePage from '../pages/HomePage';
import Login from '../pages/Login';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={(
            <GuestRoute>
              <Login />
            </GuestRoute>
          )}
        />
        <Route
          path="/accounts"
          element={(
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/categories"
          element={(
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
