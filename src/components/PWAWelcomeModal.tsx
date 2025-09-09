import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Monitor, Share, Plus, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { usePWAContext } from '../contexts/PWAContext';

export function PWAWelcomeModal() {
  const [showInstructions, setShowInstructions] = useState(false);
  const {
    isFirstVisit,
    showInstallPrompt,
    isInstalled,
    canUseNativePrompt,
    isIOS,
    isAndroid,
    isDesktop,
    promptInstall,
    dismissInstallPrompt,
    getInstallInstructions
  } = usePWAContext();

  // Mostrar apenas na primeira visita, se não estiver instalado
  const shouldShow = isFirstVisit && !isInstalled && showInstallPrompt;

  if (!shouldShow && !showInstructions) {
    return null;
  }

  const instructions = getInstallInstructions();

  const handleInstall = async () => {
    if (canUseNativePrompt) {
      await promptInstall();
    } else {
      setShowInstructions(true);
    }
  };

  const handleClose = () => {
    setShowInstructions(false);
    dismissInstallPrompt('day');
  };

  const handleNotNow = () => {
    dismissInstallPrompt('day');
  };

  const benefits = [
    { icon: '⚡', text: 'Acesso mais rápido' },
    { icon: '📱', text: 'Experiência nativa' },
    { icon: '🔒', text: 'Funciona offline' },
    { icon: '🔔', text: 'Notificações push' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-t-2xl">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl font-bold">H</div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Hub.App!</h2>
              <p className="text-white/90 text-sm">
                {showInstructions ? instructions.title : 'Instale nosso app para a melhor experiência'}
              </p>
            </div>
          </div>

          <div className="p-6">
            {!showInstructions ? (
              <>
                {/* Benefits */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-lg">{benefit.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Device-specific preview */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {isIOS || isAndroid ? (
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Monitor className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="font-medium text-gray-800">
                      Para seu {isIOS ? 'iPhone/iPad' : isAndroid ? 'Android' : 'computador'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isIOS 
                      ? 'Adicione à tela inicial para acesso rápido como um app nativo'
                      : isAndroid 
                        ? 'Instale como app nativo diretamente do navegador'
                        : 'Instale no seu sistema para acesso rápido pela área de trabalho'
                    }
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    onClick={handleInstall}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isIOS ? <Plus className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    {isIOS ? 'Adicionar à Tela Inicial' : canUseNativePrompt ? 'Instalar Agora' : 'Ver Como Instalar'}
                  </motion.button>

                  <button
                    onClick={handleNotNow}
                    className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Talvez mais tarde
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Install Instructions */}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">{instructions.icon}</div>
                  <p className="text-gray-600 text-sm">
                    Siga os passos abaixo para instalar:
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {instructions.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </motion.div>
                  ))}
                </div>

                {/* iOS specific visual cues */}
                {isIOS && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Share className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Procure por este ícone:</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      O ícone de compartilhamento fica na parte inferior do Safari (iPhone) ou no topo (iPad)
                    </p>
                  </div>
                )}

                {/* Success check */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Depois de instalado:</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    O Hub.App aparecerá como um ícone na sua tela e abrirá como um app nativo!
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full mt-6 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Entendi
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}