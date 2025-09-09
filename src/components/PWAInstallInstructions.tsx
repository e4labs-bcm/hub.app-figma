import { motion, AnimatePresence } from 'framer-motion';
import { X, Chrome, Monitor, Download, ExternalLink, Globe } from 'lucide-react';
import { usePWAContext } from '../contexts/PWAContext';

interface PWAInstallInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PWAInstallInstructions({ isOpen, onClose }: PWAInstallInstructionsProps) {
  const { isDesktop, isAndroid, isIOS } = usePWAContext();

  console.log('🎯 DEBUG: PWAInstallInstructions render', {
    isOpen,
    isDesktop,
    isAndroid,
    isIOS
  });

  if (!isOpen) {
    console.log('🎯 DEBUG: PWAInstallInstructions - not open, returning null');
    return null;
  }

  console.log('🎯 DEBUG: PWAInstallInstructions - is open, rendering modal');

  const getBrowserInstructions = () => {
    if (isIOS) {
      return {
        title: 'Instalar no iOS Safari',
        icon: '📱',
        steps: [
          { icon: '1️⃣', text: 'Toque no ícone de compartilhamento (⬆️) na parte inferior' },
          { icon: '2️⃣', text: 'Role para baixo e toque em "Adicionar à Tela de Início"' },
          { icon: '3️⃣', text: 'Toque em "Adicionar" para confirmar' },
          { icon: '✅', text: 'O Hub.App aparecerá na sua tela inicial!' }
        ]
      };
    } else if (isAndroid) {
      return {
        title: 'Instalar no Android',
        icon: '🤖',
        steps: [
          { icon: '1️⃣', text: 'Toque no menu do navegador (⋮)' },
          { icon: '2️⃣', text: 'Selecione "Instalar app" ou "Adicionar à tela inicial"' },
          { icon: '3️⃣', text: 'Confirme a instalação' },
          { icon: '✅', text: 'O Hub.App será instalado como um app nativo!' }
        ]
      };
    } else {
      return {
        title: 'Instalar no Desktop',
        icon: '💻',
        steps: [
          { icon: '🔍', text: 'Procure pelo ícone de instalação na barra de endereços' },
          { icon: '📋', text: 'Ou acesse o menu do navegador' },
          { icon: '⚙️', text: 'Procure por "Instalar Hub.App" ou similar' },
          { icon: '✅', text: 'Confirme a instalação para ter acesso rápido!' }
        ]
      };
    }
  };

  const instructions = getBrowserInstructions();

  const browserOptions = [
    {
      name: 'Chrome',
      icon: Chrome,
      steps: [
        'Clique no ícone de instalação (⊞) na barra de endereços',
        'Ou vá no menu (⋮) → "Instalar Hub.App"',
        'Ou pressione Ctrl+Shift+A (Windows) / Cmd+Shift+A (Mac)'
      ]
    },
    {
      name: 'Edge',
      icon: Monitor,
      steps: [
        'Clique no ícone de instalação (+) na barra de endereços',
        'Ou vá no menu (…) → "Apps" → "Instalar este site como app"'
      ]
    },
    {
      name: 'Firefox',
      icon: Globe,
      steps: [
        'Clique no menu (☰)',
        'Selecione "Instalar este site como app"'
      ]
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="text-4xl mb-2">{instructions.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{instructions.title}</h2>
              <p className="text-white/90">
                Siga as instruções abaixo para instalar o Hub.App
              </p>
            </div>
          </div>

          <div className="p-6">
            {isDesktop ? (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600">
                    Escolha as instruções para o seu navegador:
                  </p>
                </div>

                {browserOptions.map((browser, index) => (
                  <motion.div
                    key={browser.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <browser.icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {browser.name}
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      {browser.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            {stepIndex + 1}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Não encontra as opções?</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Algumas versões mais antigas dos navegadores podem não suportar PWAs. 
                    Certifique-se de que está usando a versão mais recente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {instructions.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-2xl">{step.icon}</span>
                    <p className="text-gray-700 leading-relaxed">{step.text}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Benefits */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Benefícios do app instalado:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Acesso mais rápido</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📱</span>
                  <span>Experiência nativa</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Funciona offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔔</span>
                  <span>Notificações push</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Entendi
              </button>
              <a
                href="https://web.dev/install-criteria/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Saber mais
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}