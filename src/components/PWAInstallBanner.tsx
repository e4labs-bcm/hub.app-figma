import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallBanner() {
  const {
    showInstallPrompt,
    isInstalled,
    canUseNativePrompt,
    isIOS,
    isAndroid,
    isDesktop,
    promptInstall,
    dismissInstallPrompt
  } = usePWAInstall();

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  const handleInstall = async () => {
    if (canUseNativePrompt) {
      await promptInstall();
    } else {
      // Para iOS ou casos onde não há prompt nativo, mostrar instruções
      // Isso será implementado no modal
    }
  };

  const getDeviceIcon = () => {
    if (isIOS || isAndroid) return <Smartphone className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getInstallText = () => {
    if (isIOS) return 'Adicionar à Tela Inicial';
    if (isAndroid) return 'Instalar App';
    return 'Instalar Hub.App';
  };

  return (
    <AnimatePresence>
      <>
        {/* Spacer to push content down */}
        <div className="h-16 md:h-20" />
        
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
        >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Icon + Text */}
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-white/20 rounded-full">
                {getDeviceIcon()}
              </div>
              
              <div className="text-white">
                <p className="font-medium text-sm">
                  Instale o Hub.App no seu dispositivo
                </p>
                <p className="text-xs text-white/80">
                  Acesso mais rápido, funciona offline e experiência nativa
                </p>
              </div>
            </div>

            {/* Benefits pills - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 mx-4">
              <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                <Zap className="w-3 h-3" />
                <span>Mais rápido</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                <Download className="w-3 h-3" />
                <span>Funciona offline</span>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleInstall}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{getInstallText()}</span>
                <span className="sm:hidden">Instalar</span>
              </motion.button>

              <button
                onClick={() => dismissInstallPrompt('day')}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Dispensar por hoje"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}