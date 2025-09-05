import { useState, useCallback } from 'react';

interface UseAppStoreReturn {
  isAppStoreOpen: boolean;
  openAppStore: () => void;
  closeAppStore: () => void;
  toggleAppStore: () => void;
}

export function useAppStore(): UseAppStoreReturn {
  const [isAppStoreOpen, setIsAppStoreOpen] = useState(false);

  const openAppStore = useCallback(() => {
    setIsAppStoreOpen(true);
  }, []);

  const closeAppStore = useCallback(() => {
    setIsAppStoreOpen(false);
  }, []);

  const toggleAppStore = useCallback(() => {
    setIsAppStoreOpen(prev => !prev);
  }, []);

  return {
    isAppStoreOpen,
    openAppStore,
    closeAppStore,
    toggleAppStore
  };
}