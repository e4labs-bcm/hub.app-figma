import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function WelcomeMessage() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Mostrar mensagem de boas-vindas após login
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    // Auto hide após 5 segundos
    const autoHideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-6 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]"
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Bem-vindo de volta!
                  </h3>
                  <p className="text-sm text-gray-600">
                    {user?.name}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                É ótimo ter você aqui novamente! Sua família está conectada e pronta para compartilhar momentos especiais.
              </p>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Sistema conectado e seguro
              </div>
            </div>

            {/* Progress bar para auto-hide */}
            <motion.div 
              className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}