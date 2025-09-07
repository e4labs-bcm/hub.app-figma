import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ModuleViewerProps {
  isOpen: boolean;
  onClose: () => void;
  moduleUrl: string;
  moduleName: string;
  showSidebar?: boolean;
}

export function ModuleViewer({ isOpen, onClose, moduleUrl, moduleName, showSidebar = true }: ModuleViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('🖥️ DEBUG: ModuleViewer renderizado:', { isOpen, moduleUrl, moduleName, showSidebar });

  // Usar uma abordagem simples para detectar largura da sidebar
  const [sidebarWidth, setSidebarWidth] = useState(256);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const detectSidebarWidth = () => {
      // Mobile = 0
      if (window.innerWidth < 768) {
        setSidebarWidth(0);
        return;
      }
      
      // Desktop: verificar se sidebar está visível
      if (!showSidebar) {
        setSidebarWidth(0);
        return;
      }
      
      // Tentar detectar pela largura real do elemento
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        console.log('🔍 DEBUG: Sidebar encontrada, width:', rect.width);
        setSidebarWidth(rect.width);
      } else {
        // Fallback: verificar estado do wrapper
        const wrapper = document.querySelector('[data-state]');
        if (wrapper) {
          const state = wrapper.getAttribute('data-state');
          console.log('🔍 DEBUG: Wrapper state:', state);
          setSidebarWidth(state === 'collapsed' ? 48 : 256);
        } else {
          setSidebarWidth(256); // Fallback padrão
        }
      }
    };
    
    // Detectar inicialmente
    detectSidebarWidth();
    
    // Polling simples a cada segundo
    const interval = setInterval(detectSidebarWidth, 1000);
    
    // Listener para resize
    window.addEventListener('resize', detectSidebarWidth);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', detectSidebarWidth);
    };
  }, [isOpen, showSidebar]);
  
  console.log('🔍 DEBUG: Sidebar width atual:', sidebarWidth);

  const handleRefresh = () => {
    setIsLoading(true);
    const iframe = document.getElementById('module-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const openExternal = () => {
    window.open(moduleUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay - apenas para mobile */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          
          {/* Modal principal */}
          <motion.div
            className="bg-white overflow-hidden shadow-2xl flex flex-col rounded-lg z-50"
            style={{
              position: 'fixed',
              top: '16px',
              right: '16px', 
              bottom: '16px',
              left: window.innerWidth < 768 ? '16px' : `${sidebarWidth + 16}px`,
              display: 'flex',
              flexDirection: 'column'
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com controles */}
            <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-3 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-sm md:text-base truncate max-w-64">
                  {moduleName}
                </h3>
                {moduleUrl && (
                  <span className="text-xs text-gray-400 hidden md:block truncate max-w-48">
                    {moduleUrl}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Botão Refresh */}
                <motion.button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Recarregar"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
                
                
                {/* Botão Abrir Externo */}
                <motion.button
                  onClick={openExternal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.button>
                
                {/* Botão Fechar */}
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Loading indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="absolute inset-x-0 top-14 z-10 flex items-center justify-center bg-gray-100 py-8"
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-sm">Carregando {moduleName}...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Iframe */}
            <iframe
              id="module-iframe"
              src={moduleUrl}
              className="w-full flex-1 border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              title={moduleName}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}