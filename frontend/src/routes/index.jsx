import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import Accounts from '../pages/Accounts';
import Budgets from '../pages/Budgets';
import Categories from '../pages/Categories';
import CreditCards from '../pages/CreditCards';
import Dashboard from '../pages/Dashboard';
import HomePage from '../pages/HomePage';
import Login from '../pages/Login';
import Transactions from '../pages/Transactions';

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
          path="/credit-cards"
          element={(
            <ProtectedRoute>
              <CreditCards />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/budgets"
          element={(
            <ProtectedRoute>
              <Budgets />
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
          path="/transactions"
          element={(
            <ProtectedRoute>
              <Transactions />
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
