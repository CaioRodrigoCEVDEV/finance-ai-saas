import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </PrivacyProvider>
    </AuthProvider>
  );
}

export default App;
