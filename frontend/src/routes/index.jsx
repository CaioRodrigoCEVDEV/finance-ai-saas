import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';
import Accounts from '../pages/Accounts';
import Budgets from '../pages/Budgets';
import Categories from '../pages/Categories';
import CreditCards from '../pages/CreditCards';
import Dashboard from '../pages/Dashboard';
import Goals from '../pages/Goals';
import HomePage from '../pages/HomePage';
import CategorizationRules from '../pages/CategorizationRules';
import Imports from '../pages/Imports';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Reports from '../pages/Reports';
import Transactions from '../pages/Transactions';
import Notifications from '../pages/Notifications';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import RecurrencesPage from '../pages/RecurrencesPage';
import FinancialCalendarPage from '../pages/FinancialCalendarPage';
import InvitesPage from '../pages/InvitesPage';
import InvoicesPage from '../pages/InvoicesPage';
import Plans from '../pages/Plans';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminTenants from '../pages/admin/AdminTenants';
import AdminTenantDetails from '../pages/admin/AdminTenantDetails';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminUserDetails from '../pages/admin/AdminUserDetails';
import AdminPlans from '../pages/admin/AdminPlans';
import AdminFeedbacks from '../pages/admin/AdminFeedbacks';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, initialized, ensureAuth } = useAuth();

  useEffect(() => {
    ensureAuth();
  }, [ensureAuth]);

  if (!initialized || loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isSuperAdmin, loading, initialized, ensureAuth } = useAuth();

  useEffect(() => {
    ensureAuth();
  }, [ensureAuth]);

  if (!initialized || loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
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
          path="/register"
          element={(
            <GuestRoute>
              <Register />
            </GuestRoute>
          )}
        />
        <Route
          path="/cadastro"
          element={(
            <GuestRoute>
              <Register />
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
          path="/goals"
          element={(
            <ProtectedRoute>
              <Goals />
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
          path="/imports"
          element={(
            <ProtectedRoute>
              <Imports />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/categorization-rules"
          element={(
            <ProtectedRoute>
              <CategorizationRules />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/reports"
          element={(
            <ProtectedRoute>
              <Reports />
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
        <Route
          path="/notifications"
          element={(
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/profile"
          element={(
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/settings"
          element={(
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/recurrences"
          element={(
            <ProtectedRoute>
              <RecurrencesPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/calendar"
          element={(
            <ProtectedRoute>
              <FinancialCalendarPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/invites"
          element={(
            <ProtectedRoute>
              <InvitesPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/invoices"
          element={(
            <ProtectedRoute>
              <InvoicesPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/plans"
          element={(
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          )}
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={(
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/tenants"
          element={(
            <AdminRoute>
              <AdminTenants />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/tenants/:id"
          element={(
            <AdminRoute>
              <AdminTenantDetails />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/users"
          element={(
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/users/:id"
          element={(
            <AdminRoute>
              <AdminUserDetails />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/plans"
          element={(
            <AdminRoute>
              <AdminPlans />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/feedbacks"
          element={(
            <AdminRoute>
              <AdminFeedbacks />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/audit-logs"
          element={(
            <AdminRoute>
              <AdminAuditLogs />
            </AdminRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
