import { motion } from 'framer-motion';
import backgroundImage from 'figma:asset/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png';
import { EventBanner } from './EventBanner';
import { AppStore } from './AppStore';
import { useSettings } from '../hooks/useSettings';

interface DesktopHomeProps {
  isAppStoreOpen?: boolean;
  onAppStoreClose?: () => void;
}

export function DesktopHome({ isAppStoreOpen = false, onAppStoreClose }: DesktopHomeProps) {
  const { background, logo, banner } = useSettings();
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Image - Full screen */}
      <motion.div 
        className="absolute inset-0 bg-cover"
        style={{ 
          backgroundImage: `url(${background.image})`,
          backgroundPosition: background.position,
          backgroundSize: background.size,
          opacity: background.opacity
        }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: background.opacity }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      {/* Overlay to ensure text readability */}
      <motion.div 
        className="absolute inset-0 bg-black/20" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* Event Banner - Overlay at top */}
      {banner.enabled && (
        <motion.div 
          className="absolute top-0 left-0 right-0 z-30"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="my-[8px] px-[17px] py-[24px] mx-[0px] my-[1px]">
            <EventBanner variant="desktop" />
          </div>
        </motion.div>
      )}
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full justify-center items-center py-[277px] my-[-1px] py-[138px] mx-[0px] my-[84px] px-[28px]">
        {/* Header with Logo */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {logo.type === 'image' && logo.imageUrl ? (
            <motion.img
              src={logo.imageUrl}
              alt="Logo"
              className={`object-contain mx-auto ${logo.showShadow ? 'drop-shadow-lg' : ''}`}
              style={{
                maxWidth: `${logo.size.width * 1.3}rem`, // Slightly larger for desktop
                maxHeight: `${logo.size.height * 1.3}rem`,
                width: 'auto',
                height: 'auto'
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.h1 
              className={`text-white text-6xl font-light tracking-wider italic ${logo.showShadow ? 'drop-shadow-lg' : ''}`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {logo.text}
            </motion.h1>
          )}
        </motion.div>
        
        {/* Main content area */}
        <motion.div 
          className="text-center text-white/80 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <motion.p 
            className="text-xl mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            Bem-vindos à nossa comunidade
          </motion.p>
          <motion.p 
            className="text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            Use o menu lateral para navegar pelos recursos
          </motion.p>
        </motion.div>
      </div>

      {/* App Store for Desktop */}
      {isAppStoreOpen && (
        <motion.div
          className="absolute inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AppStore 
            isOpen={isAppStoreOpen} 
            onClose={onAppStoreClose || (() => {})}
            isMobile={false}
          />
        </motion.div>
      )}
    </div>
  );
}