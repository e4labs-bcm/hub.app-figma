// Exemplo de como adaptar o App.tsx para seu projeto
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PanelLeft } from 'lucide-react';
import { AnimatedAppGrid } from './components/AnimatedAppGrid';
import { EventBanner } from './components/EventBanner';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { DesktopHome } from './components/DesktopHome';

// Import da sua imagem de fundo personalizada
import backgroundImage from './assets/minha-imagem-fundo.jpg';

// Hooks personalizados para seus dados
import { useAuth } from './hooks/useAuth';
import { useApps } from './hooks/useApps';
import { useCurrentEvent } from './hooks/useCurrentEvent';

export default function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Hooks para dados reais
  const { user, loading: authLoading } = useAuth();
  const { apps, loading: appsLoading } = useApps();
  const { currentEvent, loading: eventLoading } = useCurrentEvent();

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Loading state
  if (authLoading || appsLoading || eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // Não autenticado - redirecionar ou mostrar login
  if (!user) {
    return <LoginComponent />; // Seu componente de login
  }

  return (
    <ResponsiveLayout showSidebar={showSidebar} onToggleSidebar={toggleSidebar}>
      {/* Mobile Layout Content */}
      <motion.div 
        className="md:hidden relative w-full h-screen overflow-hidden bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Image Personalizada */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        
        {/* Overlay */}
        <motion.div 
          className="absolute inset-0 bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header personalizado com nome da família */}
          <motion.div 
            className="flex justify-center pt-16 pb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.h1 
              className="text-white text-4xl font-light tracking-wider italic"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {user.familyName || 'Família'}
            </motion.h1>
          </motion.div>
          
          {/* App Grid com dados reais */}
          <motion.div 
            className="flex-1 px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <AnimatedAppGrid apps={apps} />
          </motion.div>
          
          {/* Event Banner - só mostra se houver evento atual */}
          {currentEvent && (
            <motion.div 
              className="p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <EventBanner 
                event={currentEvent}
                variant="mobile"
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Desktop Layout Content */}
      <motion.div 
        className="hidden md:block relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Show Sidebar Button */}
        <AnimatePresence>
          {!showSidebar && (
            <motion.button
              onClick={toggleSidebar}
              className="absolute top-4 left-4 z-50 bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              title="Mostrar menu lateral"
            >
              <PanelLeft className="w-5 h-5" />
              
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Mostrar menu
              </div>
            </motion.button>
          )}
        </AnimatePresence>
        
        <DesktopHome 
          user={user}
          currentEvent={currentEvent}
          backgroundImage={backgroundImage}
        />
      </motion.div>
    </ResponsiveLayout>
  );
}

// Componente de Login de exemplo
function LoginComponent() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-white max-w-md w-full mx-4">
        <h1 className="text-2xl font-light mb-6 text-center">
          Portal da Família
        </h1>
        {/* Seu formulário de login aqui */}
        <form>
          <input 
            type="email" 
            placeholder="Email"
            className="w-full p-3 mb-4 bg-white/20 rounded-lg text-white placeholder-white/70"
          />
          <input 
            type="password" 
            placeholder="Senha"
            className="w-full p-3 mb-6 bg-white/20 rounded-lg text-white placeholder-white/70"
          />
          <button 
            type="submit"
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}