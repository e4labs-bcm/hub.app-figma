import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone } from 'lucide-react';

export function PWATestButton() {
  const [showTest, setShowTest] = useState(false);

  // Só mostrar em development
  if (import.meta.env.PROD) {
    return null;
  }

  const testServiceWorker = async () => {
    console.log('🔧 Testando Service Worker...');
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registrado:', registration);
        alert('Service Worker registrado com sucesso!');
      } catch (error) {
        console.error('❌ Erro no Service Worker:', error);
        alert('Erro no Service Worker: ' + error);
      }
    } else {
      alert('Service Worker não suportado');
    }
  };

  const testManifest = async () => {
    console.log('🔧 Testando Manifest...');
    
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      console.log('✅ Manifest carregado:', manifest);
      alert('Manifest carregado: ' + manifest.name);
    } catch (error) {
      console.error('❌ Erro no Manifest:', error);
      alert('Erro no Manifest: ' + error);
    }
  };

  const forceInstallPrompt = () => {
    console.log('🔧 Forçando Install Prompt...');
    
    // Simular beforeinstallprompt
    const event = new CustomEvent('beforeinstallprompt', {
      detail: { 
        prompt: () => console.log('Simulated prompt'),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      }
    });
    
    window.dispatchEvent(event);
    alert('Install prompt forçado! Verifique se apareceu.');
  };

  const checkPWAStatus = () => {
    console.log('🔧 Status PWA:');
    console.log('- Service Worker support:', 'serviceWorker' in navigator);
    console.log('- HTTPS:', location.protocol === 'https:' || location.hostname === 'localhost');
    console.log('- Display mode:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('- User agent:', navigator.userAgent);
    
    alert('Verifique o console para detalhes do status PWA');
  };

  if (!showTest) {
    return (
      <motion.button
        onClick={() => setShowTest(true)}
        className="fixed top-4 left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="PWA Test Tools"
      >
        PWA Test
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-xl border p-4 min-w-64"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">PWA Tests</h3>
        <button
          onClick={() => setShowTest(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        <button
          onClick={testServiceWorker}
          className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Test Service Worker
        </button>

        <button
          onClick={testManifest}
          className="w-full bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors"
        >
          Test Manifest
        </button>

        <button
          onClick={forceInstallPrompt}
          className="w-full bg-orange-600 text-white py-2 px-3 rounded text-sm hover:bg-orange-700 transition-colors"
        >
          Force Install Prompt
        </button>

        <button
          onClick={checkPWAStatus}
          className="w-full bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 transition-colors"
        >
          Check PWA Status
        </button>
      </div>
    </motion.div>
  );
}