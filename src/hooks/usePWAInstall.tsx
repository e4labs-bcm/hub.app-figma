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
  showInstructionsModal: boolean;
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
    deferredPrompt: null,
    showInstructionsModal: false
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

    // Debug: log state inicial
    console.log('🚀 DEBUG: PWA Hook initialized', {
      isIOS,
      isAndroid, 
      isDesktop,
      isInstalled,
      isFirstVisit,
      showInstallPrompt: !isInstalled && !wasDismissedRecently
    });

    // Listener para beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🚀 DEBUG: beforeinstallprompt event received');
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
      console.log('🚀 DEBUG: appinstalled event received');
      setInstallState(prev => ({
        ...prev,
        isInstalled: true,
        showInstallPrompt: false,
        deferredPrompt: null
      }));
    };

    // Debug: verificar se eventos são suportados
    console.log('🚀 DEBUG: Adding event listeners');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback: Para desenvolvimento, simular que é instalável após 2 segundos
    if (import.meta.env.DEV && isDesktop) {
      console.log('🚀 DEBUG: Development mode, simulating installable state');
      setTimeout(() => {
        setInstallState(prev => ({
          ...prev,
          isInstallable: true,
          // Não definir canUseNativePrompt como true para forçar fallback
        }));
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    console.log('🚀 DEBUG: promptInstall called', {
      canUseNativePrompt: installState.canUseNativePrompt,
      hasDeferredPrompt: !!installState.deferredPrompt,
      isDesktop: installState.isDesktop,
      isInstallable: installState.isInstallable
    });

    if (installState.deferredPrompt && installState.canUseNativePrompt) {
      try {
        console.log('🚀 DEBUG: Using native prompt');
        await installState.deferredPrompt.prompt();
        const choiceResult = await installState.deferredPrompt.userChoice;
        
        console.log('🚀 DEBUG: User choice:', choiceResult.outcome);
        
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
    } else {
      // Fallback para quando não há prompt nativo
      console.log('🚀 DEBUG: No native prompt, showing manual instructions');
      
      // Mostrar modal de instruções para qualquer dispositivo sem prompt nativo
      setInstallState(prev => ({ 
        ...prev, 
        showInstructionsModal: true 
      }));
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
      showInstructionsModal: true
    }));
  };

  const closeInstructionsModal = () => {
    setInstallState(prev => ({
      ...prev,
      showInstructionsModal: false
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
    closeInstructionsModal,
    getInstallInstructions
  };
}