import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallFAB() {
  const [isHovered, setIsHovered] = useState(false);
  const {
    showInstallPrompt,
    isInstalled,
    canUseNativePrompt,
    isIOS,
    promptInstall,
    showInstallInstructions
  } = usePWAInstall();

  // Não mostrar se estiver instalado ou não deve mostrar prompt
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  const handleInstall = async () => {
    if (canUseNativePrompt) {
      await promptInstall();
    } else {
      // Para iOS, mostrar instruções
      showInstallInstructions();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          onClick={handleInstall}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative group bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          style={{
            background: isHovered 
              ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' 
              : 'linear-gradient(45deg, #2563eb, #7c3aed)'
          }}
        >
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
          
          {/* Icon */}
          <div className="relative z-10 flex items-center gap-2">
            {isIOS ? (
              <Smartphone className="w-5 h-5" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            
            {/* Text on hover - Desktop only */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden lg:block text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  {isIOS ? 'Adicionar à Tela' : 'Instalar App'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Tooltip for mobile */}
          <div className="lg:hidden absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {isIOS ? 'Adicionar à Tela Inicial' : 'Instalar como App'}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}