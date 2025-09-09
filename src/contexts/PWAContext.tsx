import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
// Removendo usePWAInstall para evitar múltiplas instâncias

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
  showInstructionsModal: boolean;
}

interface PWAContextType extends PWAInstallState {
  promptInstall: () => Promise<void>;
  dismissInstallPrompt: (duration?: 'day' | 'week' | 'forever') => void;
  showInstallInstructions: () => void;
  closeInstructionsModal: () => void;
  getInstallInstructions: () => {
    title: string;
    steps: string[];
    icon: string;
  };
}

const PWAContext = createContext<PWAContextType | null>(null);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [installState, setInstallState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: false,
    showInstallPrompt: false,
    isFirstVisit: false,
    canUseNativePrompt: false,
    deferredPrompt: null,
    showInstructionsModal: false
  });

  useEffect(() => {
    console.log('🔥 PWAProvider: Initializing PWA context');
    
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

    console.log('🔥 PWAProvider: Device detection', {
      isIOS,
      isAndroid,
      isDesktop,
      isInstalled,
      isFirstVisit,
      wasDismissedRecently
    });

    setInstallState(prev => ({
      ...prev,
      isIOS,
      isAndroid,
      isDesktop,
      isInstalled,
      isFirstVisit,
      showInstallPrompt: !isInstalled && !wasDismissedRecently
    }));

    // Listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🔥 PWAProvider: beforeinstallprompt event received');
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
      console.log('🔥 PWAProvider: appinstalled event received');
      setInstallState(prev => ({
        ...prev,
        isInstalled: true,
        showInstallPrompt: false,
        deferredPrompt: null
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback para desenvolvimento
    if (import.meta.env.DEV && isDesktop) {
      console.log('🔥 PWAProvider: Development mode fallback');
      setTimeout(() => {
        setInstallState(prev => ({
          ...prev,
          isInstallable: true
        }));
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    console.log('🔥 PWAProvider: promptInstall called', {
      canUseNativePrompt: installState.canUseNativePrompt,
      hasDeferredPrompt: !!installState.deferredPrompt,
      showInstructionsModal: installState.showInstructionsModal
    });

    if (installState.deferredPrompt && installState.canUseNativePrompt) {
      try {
        console.log('🔥 PWAProvider: Using native prompt');
        await installState.deferredPrompt.prompt();
        const choiceResult = await installState.deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('🔥 PWAProvider: PWA installation accepted');
        }
        
        setInstallState(prev => ({
          ...prev,
          deferredPrompt: null,
          canUseNativePrompt: false
        }));
      } catch (error) {
        console.error('🔥 PWAProvider: Error with native prompt:', error);
        showInstallInstructions();
      }
    } else {
      console.log('🔥 PWAProvider: No native prompt, showing instructions');
      showInstallInstructions();
    }
  };

  const showInstallInstructions = () => {
    console.log('🔥 PWAProvider: showInstallInstructions called');
    setInstallState(prev => {
      console.log('🔥 PWAProvider: Setting showInstructionsModal to true', {
        previousValue: prev.showInstructionsModal
      });
      return {
        ...prev,
        showInstructionsModal: true
      };
    });
  };

  const closeInstructionsModal = () => {
    console.log('🔥 PWAProvider: closeInstructionsModal called');
    setInstallState(prev => ({
      ...prev,
      showInstructionsModal: false
    }));
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

  const contextValue: PWAContextType = {
    ...installState,
    promptInstall,
    dismissInstallPrompt,
    showInstallInstructions,
    closeInstructionsModal,
    getInstallInstructions
  };

  // Debug log do estado atual
  console.log('🔥 PWAProvider: Current state', {
    showInstructionsModal: installState.showInstructionsModal,
    isDesktop: installState.isDesktop
  });

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
}