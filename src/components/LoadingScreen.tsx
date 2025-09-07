import { motion } from 'framer-motion';
import backgroundImage from '../assets/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png';

export function LoadingScreen() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      {/* Overlay */}
      <motion.div 
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Logo */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.h1 
            className="text-white text-5xl md:text-6xl font-light tracking-wider italic"
            animate={{ 
              scale: [1, 1.02, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Família
          </motion.h1>
        </motion.div>

        {/* Loading Animation */}
        <motion.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Spinner */}
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Inner circle */}
            <motion.div
              className="absolute inset-2 w-12 h-12 border-2 border-white/10 border-b-white/50 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Loading Text */}
          <motion.p 
            className="text-white/80 font-medium tracking-wide"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Carregando...
          </motion.p>

          {/* Loading Dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-white/60 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}