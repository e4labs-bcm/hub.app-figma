import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { usePWAContext } from '../contexts/PWAContext';

export function PWAInstallInstructionsModal() {
  const { showInstructionsModal, closeInstructionsModal, isDesktop, isAndroid, isIOS } = usePWAContext();

  if (!showInstructionsModal) {
    return null;
  }

  const getInstructions = () => {
    if (isIOS) {
      return {
        title: 'Instalar no iOS Safari',
        icon: '📱',
        steps: [
          '1. Toque no ícone de compartilhamento (⬆️) na parte inferior',
          '2. Role para baixo e toque em "Adicionar à Tela de Início"',
          '3. Toque em "Adicionar" para confirmar',
          '4. O Hub.App aparecerá na sua tela inicial!'
        ]
      };
    } else if (isAndroid) {
      return {
        title: 'Instalar no Android',
        icon: '🤖',
        steps: [
          '1. Toque no menu do navegador (⋮)',
          '2. Selecione "Instalar app" ou "Adicionar à tela inicial"',
          '3. Confirme a instalação',
          '4. O Hub.App será instalado como um app nativo!'
        ]
      };
    } else {
      return {
        title: 'Instalar no Desktop',
        icon: '💻',
        steps: [
          '1. Procure pelo ícone de instalação na barra de endereços',
          '2. Ou acesse o menu do navegador',
          '3. Procure por "Instalar Hub.App" ou similar',
          '4. Confirme a instalação para ter acesso rápido!'
        ]
      };
    }
  };

  const instructions = getInstructions();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={closeInstructionsModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{instructions.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {instructions.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Siga os passos abaixo
                </p>
              </div>
            </div>
            <button
              onClick={closeInstructionsModal}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {step.replace(/^\d+\.\s*/, '')}
                </p>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-500" />
              Benefícios da instalação
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Acesso mais rápido sem abrir o navegador</li>
              <li>• Funciona offline para algumas funcionalidades</li>
              <li>• Experiência nativa como um app real</li>
              <li>• Notificações quando disponíveis</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={closeInstructionsModal}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
          >
            Entendi!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}