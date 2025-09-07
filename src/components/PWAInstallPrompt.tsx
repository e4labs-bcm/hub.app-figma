import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed', platform: string}>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar se já está instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;

    if (isInstalled) {
      return; // Não mostrar prompt se já estiver instalado
    }

    // Android/Chrome - beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      console.log('PWA Install prompt intercepted');
      e.preventDefault();
      setDeferredPrompt(event);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS - mostrar prompt manual após um tempo
    if (iOS && !isInstalled) {
      const timer = setTimeout(() => {
        console.log('PWA: Showing iOS install prompt');
        setShowInstallPrompt(true);
      }, 5000); // Mostrar após 5 segundos no iOS

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(timer);
      };
    }

    // Para debug - forçar aparecer em development após 8 segundos
    if (import.meta.env.DEV && !isInstalled) {
      const debugTimer = setTimeout(() => {
        console.log('PWA: Showing debug install prompt (development)');
        setShowInstallPrompt(true);
      }, 8000);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(debugTimer);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome
      setShowInstallPrompt(false);
      deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      console.log('User choice:', choiceResult);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    
    // Não mostrar novamente nesta sessão
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Não mostrar se foi dispensado nesta sessão
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Instalar Hub.App
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Acesse rapidamente pelo seu dispositivo
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isIOS ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Para instalar este app no seu iPhone:
              </p>
              <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>1. Toque no ícone de compartilhar ⬆️</li>
                <li>2. Role para baixo e toque em "Adicionar à Tela de Início"</li>
                <li>3. Toque em "Adicionar"</li>
              </ol>
            </div>
          ) : (
            <div className="flex gap-2">
              <motion.button
                onClick={handleInstallClick}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Instalar App
              </motion.button>
              <motion.button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Agora não
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}