import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { ToastProvider } from './contexts/ToastContext';
import { requestPushPermission } from './services/pushSubscriptionService';

function PushInitializer() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        requestPushPermission(registration);
      }
    }
  });

  useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <ToastProvider>
          <PushInitializer />
          <AppRoutes />
        </ToastProvider>
      </PrivacyProvider>
    </AuthProvider>
  );
}

export default App;
