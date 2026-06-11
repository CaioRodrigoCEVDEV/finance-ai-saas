import { Download } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Button from './ui/Button';

function isRunningStandalone() {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia('(display-mode: standalone)').matches) return true;

  return false;
}

function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (isRunningStandalone()) return;

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowButton(true);
    }

    function handleAppInstalled() {
      setShowButton(false);
      setDeferredPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowButton(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (!showButton) return null;

  return (
    <Button variant="secondary" size="sm" onClick={handleInstallClick} className="gap-2">
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Instalar app</span>
    </Button>
  );
}

export default PwaInstallButton;
