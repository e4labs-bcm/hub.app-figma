import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  showInstallPrompt: boolean;
  isFirstVisit: boolean;
  canUseNativePrompt: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

export function usePWAInstall() {
  const [installState, setInstallState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: false,
    showInstallPrompt: false,
    isFirstVisit: false,
    canUseNativePrompt: false,
    deferredPrompt: null
  });

  useEffect(() => {
    // Detectar dispositivo
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isDesktop = !isIOS && !isAndroid;

    // Verificar se já está instalado
    const isInstalled = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    // Verificar primeira visita
    const hasVisited = localStorage.getItem('hub-app-visited');
    const isFirstVisit = !hasVisited;
    if (isFirstVisit) {
      localStorage.setItem('hub-app-visited', 'true');
    }

    // Verificar se foi dispensado recentemente
    const dismissedRecently = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissedRecently ? parseInt(dismissedRecently) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const wasDismissedRecently = dismissedTime > oneDayAgo;

    setInstallState(prev => ({
      ...prev,
      isIOS,
      isAndroid,
      isDesktop,
      isInstalled,
      isFirstVisit,
      showInstallPrompt: !isInstalled && !wasDismissedRecently
    }));

    // Listener para beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      e.preventDefault();
      
      setInstallState(prev => ({
        ...prev,
        deferredPrompt: event,
        canUseNativePrompt: true,
        isInstallable: true
      }));
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setInstallState(prev => ({
        ...prev,
        isInstalled: true,
        showInstallPrompt: false,
        deferredPrompt: null
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (installState.deferredPrompt && installState.canUseNativePrompt) {
      try {
        await installState.deferredPrompt.prompt();
        const choiceResult = await installState.deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installation accepted');
        }
        
        setInstallState(prev => ({
          ...prev,
          deferredPrompt: null,
          canUseNativePrompt: false
        }));
      } catch (error) {
        console.error('Error prompting PWA install:', error);
      }
    }
  };

  const dismissInstallPrompt = (duration: 'day' | 'week' | 'forever' = 'day') => {
    const now = Date.now();
    const dismissUntil = duration === 'forever' ? now + (365 * 24 * 60 * 60 * 1000) :
                       duration === 'week' ? now + (7 * 24 * 60 * 60 * 1000) :
                       now + (24 * 60 * 60 * 1000);
    
    localStorage.setItem('pwa-install-dismissed', dismissUntil.toString());
    
    setInstallState(prev => ({
      ...prev,
      showInstallPrompt: false
    }));
  };

  const showInstallInstructions = () => {
    setInstallState(prev => ({
      ...prev,
      showInstallPrompt: true
    }));
  };

  const getInstallInstructions = () => {
    if (installState.isIOS) {
      return {
        title: 'Instalar Hub.App no iOS',
        steps: [
          'Toque no ícone de compartilhamento (⬆️)',
          'Role para baixo e toque em "Adicionar à Tela de Início"',
          'Toque em "Adicionar" para confirmar',
          'O Hub.App aparecerá na sua tela inicial!'
        ],
        icon: '📱'
      };
    } else if (installState.isAndroid) {
      return {
        title: 'Instalar Hub.App no Android',
        steps: [
          'Toque no menu do navegador (⋮)',
          'Selecione "Instalar app" ou "Adicionar à tela inicial"',
          'Confirme a instalação',
          'O Hub.App será instalado como um app nativo!'
        ],
        icon: '🤖'
      };
    } else {
      return {
        title: 'Instalar Hub.App no Desktop',
        steps: [
          'Clique no ícone de instalação na barra de endereços',
          'Ou vá no menu → "Instalar Hub.App"',
          'Confirme a instalação',
          'O app será instalado no seu sistema!'
        ],
        icon: '💻'
      };
    }
  };

  return {
    ...installState,
    promptInstall,
    dismissInstallPrompt,
    showInstallInstructions,
    getInstallInstructions
  };
}