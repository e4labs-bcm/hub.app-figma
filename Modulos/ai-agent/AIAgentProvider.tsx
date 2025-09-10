import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { FloatingChatButton } from './components/FloatingChatButton';
import { ChatModal } from './components/ChatModal';
import { extractPageContext } from './utils/aiHelpers';

interface AIAgentContextType {
  isOpen: boolean;
  isMinimized: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  setContext: (module?: string, page?: string) => void;
}

const AIAgentContext = createContext<AIAgentContextType | undefined>(undefined);

export function useAIAgent() {
  const context = useContext(AIAgentContext);
  if (!context) {
    throw new Error('useAIAgent must be used within an AIAgentProvider');
  }
  return context;
}

interface AIAgentProviderProps {
  children: ReactNode;
  enabled?: boolean;
  isMobile?: boolean;
}

export function AIAgentProvider({ 
  children, 
  enabled = true,
  isMobile = false 
}: AIAgentProviderProps) {
  const [isOpen, setIsOpen] = useState(false); // Always start closed
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentModule, setCurrentModule] = useState<string>();
  const [currentPage, setCurrentPage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    // Auto-detect context when opening
    const context = extractPageContext();
    setCurrentModule(context.module);
    setCurrentPage(context.page);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const minimizeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(true);
  }, []);

  const toggleChat = useCallback(() => {
    console.log('🔄 toggleChat called - current state:', { isOpen, isMinimized });
    if (isOpen) {
      console.log('🔽 Minimizing chat');
      minimizeChat();
    } else {
      console.log('🔼 Opening chat');
      openChat();
    }
  }, [isOpen, openChat, minimizeChat]);

  const setContext = useCallback((module?: string, page?: string) => {
    setCurrentModule(module);
    setCurrentPage(page);
  }, []);

  // Listen for custom event to open chat from grid icon
  useEffect(() => {
    const handleOpenAIChat = (event: CustomEvent) => {
      console.log('🤖 Received openAIChat event:', event.detail);
      openChat();
    };

    window.addEventListener('openAIChat', handleOpenAIChat as EventListener);
    
    return () => {
      window.removeEventListener('openAIChat', handleOpenAIChat as EventListener);
    };
  }, [openChat]);

  // Debug state changes  
  useEffect(() => {
    console.log('🤖 AIAgentProvider state:', { isOpen, isMinimized });
  }, [isOpen, isMinimized]);

  const contextValue: AIAgentContextType = {
    isOpen,
    isMinimized,
    openChat,
    closeChat,
    toggleChat,
    minimizeChat,
    setContext,
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <AIAgentContext.Provider value={contextValue}>
      {children}
      
      {/* Floating Chat Button - show when minimized or when completely closed */}
      <FloatingChatButton
        isOpen={isOpen}
        isMinimized={isMinimized}
        isLoading={isLoading}
        onClick={toggleChat}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={isOpen}
        onClose={closeChat}
        onMinimize={minimizeChat}
        isMobile={isMobile}
        currentModule={currentModule}
        currentPage={currentPage}
      />
    </AIAgentContext.Provider>
  );
}