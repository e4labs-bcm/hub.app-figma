import { createContext, useContext, ReactNode } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

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
  const pwaState = usePWAInstall();

  return (
    <PWAContext.Provider value={pwaState}>
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