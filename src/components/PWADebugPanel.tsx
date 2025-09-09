import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, Trash2, RefreshCw } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWADebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const pwaState = usePWAInstall();
  
  console.log('🔧 DEBUG: PWADebugPanel render', {
    isOpen,
    isInstalled: pwaState.isInstalled,
    showInstallPrompt: pwaState.showInstallPrompt
  });

  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) {
    return null;
  }

  const clearAllPWAData = () => {
    localStorage.removeItem('hub-app-visited');
    localStorage.removeItem('pwa-install-dismissed');
    window.location.reload();
  };

  const forceShowPrompts = () => {
    localStorage.removeItem('pwa-install-dismissed');
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
        title="PWA Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-xl border p-4 w-96 max-h-80 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bug className="w-5 h-5 text-red-600" />
          PWA Debug
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Estado atual */}
      <div className="space-y-2 mb-4 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div><strong>isInstalled:</strong> {String(pwaState.isInstalled)}</div>
          <div><strong>isInstallable:</strong> {String(pwaState.isInstallable)}</div>
          <div><strong>showInstallPrompt:</strong> {String(pwaState.showInstallPrompt)}</div>
          <div><strong>canUseNativePrompt:</strong> {String(pwaState.canUseNativePrompt)}</div>
          <div><strong>isFirstVisit:</strong> {String(pwaState.isFirstVisit)}</div>
          <div><strong>showInstructionsModal:</strong> {String(pwaState.showInstructionsModal)}</div>
          <div><strong>isDesktop:</strong> {String(pwaState.isDesktop)}</div>
          <div><strong>isAndroid:</strong> {String(pwaState.isAndroid)}</div>
          <div><strong>isIOS:</strong> {String(pwaState.isIOS)}</div>
          <div><strong>hasDeferredPrompt:</strong> {String(!!pwaState.deferredPrompt)}</div>
        </div>
      </div>

      {/* LocalStorage */}
      <div className="mb-4 text-xs">
        <strong>LocalStorage:</strong>
        <div className="bg-gray-100 p-2 rounded mt-1 font-mono">
          <div>visited: {localStorage.getItem('hub-app-visited')}</div>
          <div>dismissed: {localStorage.getItem('pwa-install-dismissed')}</div>
        </div>
      </div>

      {/* Ações */}
      <div className="space-y-2">
        <button
          onClick={clearAllPWAData}
          className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Limpar Todos os Dados PWA
        </button>
        
        <button
          onClick={forceShowPrompts}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Forçar Mostrar Prompts
        </button>

        <button
          onClick={() => pwaState.promptInstall()}
          className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          <Bug className="w-4 h-4" />
          Testar promptInstall()
        </button>

        <button
          onClick={() => pwaState.showInstallInstructions()}
          className="w-full flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
        >
          <Bug className="w-4 h-4" />
          Testar Instruções
        </button>

        <button
          onClick={() => {
            console.log('🔧 DEBUG: Force opening instructions modal');
            console.log('🔧 DEBUG: Current state before:', pwaState.showInstructionsModal);
            pwaState.showInstallInstructions();
            // Forçar abertura diretamente
            setTimeout(() => {
              console.log('🔧 DEBUG: Current modal state after:', pwaState.showInstructionsModal);
            }, 100);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
        >
          <Bug className="w-4 h-4" />
          Forçar Modal Debug
        </button>

        <button
          onClick={() => {
            console.log('🔧 ALERT: Testing simple alert');
            alert('Se você vê esta mensagem, o botão está funcionando!\n\nO problema é que o modal não está sendo exibido corretamente.');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
        >
          <Bug className="w-4 h-4" />
          Teste Alert Simples
        </button>
      </div>
    </motion.div>
  );
}