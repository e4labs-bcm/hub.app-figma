import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, X } from 'lucide-react';

export function PWADebug() {
  const [debugInfo, setDebugInfo] = useState({
    isServiceWorkerSupported: false,
    isServiceWorkerRegistered: false,
    isManifestSupported: false,
    isHTTPS: false,
    isInstallable: false,
    isInstalled: false,
    userAgent: '',
    errors: [] as string[]
  });
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const checkPWAStatus = async () => {
      const errors: string[] = [];
      
      // Check Service Worker support
      const isServiceWorkerSupported = 'serviceWorker' in navigator;
      
      // Check if registered
      let isServiceWorkerRegistered = false;
      if (isServiceWorkerSupported) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          isServiceWorkerRegistered = !!registration;
        } catch (e) {
          errors.push('Service Worker registration failed: ' + e);
        }
      } else {
        errors.push('Service Worker not supported');
      }

      // Check Manifest support  
      const isManifestSupported = 'getManifest' in window;
      if (!isManifestSupported) {
        errors.push('Web App Manifest not supported');
      }

      // Check HTTPS
      const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
      if (!isHTTPS) {
        errors.push('PWA requires HTTPS (except localhost)');
      }

      // Check if already installed
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;

      // Check if installable (beforeinstallprompt fired)
      const isInstallable = sessionStorage.getItem('pwa-installable') === 'true';

      setDebugInfo({
        isServiceWorkerSupported,
        isServiceWorkerRegistered,
        isManifestSupported,
        isHTTPS,
        isInstallable,
        isInstalled,
        userAgent: navigator.userAgent,
        errors
      });
    };

    checkPWAStatus();

    // Listen for beforeinstallprompt to know it's installable
    const handleBeforeInstallPrompt = () => {
      sessionStorage.setItem('pwa-installable', 'true');
      setDebugInfo(prev => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  if (!showDebug) {
    return (
      <motion.button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-20 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="PWA Debug Info"
      >
        <Info className="w-5 h-5" />
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-4 max-w-md max-h-96 overflow-y-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">PWA Debug</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Service Worker Support:</span>
          <span className={debugInfo.isServiceWorkerSupported ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.isServiceWorkerSupported ? '✅' : '❌'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Service Worker Registered:</span>
          <span className={debugInfo.isServiceWorkerRegistered ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.isServiceWorkerRegistered ? '✅' : '❌'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Manifest Support:</span>
          <span className={debugInfo.isManifestSupported ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.isManifestSupported ? '✅' : '❌'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>HTTPS/Localhost:</span>
          <span className={debugInfo.isHTTPS ? 'text-green-600' : 'text-red-600'}>
            {debugInfo.isHTTPS ? '✅' : '❌'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Installable:</span>
          <span className={debugInfo.isInstallable ? 'text-green-600' : 'text-orange-600'}>
            {debugInfo.isInstallable ? '✅' : '⏳'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Already Installed:</span>
          <span className={debugInfo.isInstalled ? 'text-green-600' : 'text-gray-600'}>
            {debugInfo.isInstalled ? '✅' : '❌'}
          </span>
        </div>

        {debugInfo.errors.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded border-l-4 border-red-400">
            <h4 className="font-semibold text-red-800 mb-1">Issues:</h4>
            {debugInfo.errors.map((error, index) => (
              <div key={index} className="text-red-700 text-xs">{error}</div>
            ))}
          </div>
        )}

        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
          <strong>User Agent:</strong>
          <div className="break-words">{debugInfo.userAgent}</div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          <strong>Tips:</strong>
          <ul className="list-disc list-inside mt-1">
            <li>PWA install prompt may take 10+ seconds</li>
            <li>Try refreshing the page</li>
            <li>Check console for errors</li>
            <li>Test on HTTPS domain for full functionality</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}