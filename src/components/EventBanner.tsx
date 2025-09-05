import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface EventBannerProps {
  variant?: 'mobile' | 'desktop';
}

export function EventBanner({ variant = 'mobile' }: EventBannerProps) {
  const isDesktop = variant === 'desktop';
  const { banner } = useSettings();

  return (
    <motion.div 
      className={`${
        isDesktop 
          ? "bg-black/70 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/10" 
          : "bg-white/90 backdrop-blur-sm rounded-3xl p-4"
      }`}
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${banner.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      whileHover={{ scale: isDesktop ? 1.01 : 1.02, y: isDesktop ? -1 : -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between px-[0px] py-[1px] mx-[0px] my-[-1px]">
        {/* Content layout - horizontal for desktop, vertical for mobile */}
        <div className={`${isDesktop ? "flex items-center gap-6" : "flex-1 px-[0px] py-[4px] mx-[0px] my-[3px]"}`}>
          {/* Title */}
          <motion.div 
            className={`flex items-center gap-2 ${!isDesktop ? "mb-1" : ""}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={`${isDesktop ? "text-xl" : "text-2xl"} font-bold text-white`}>
              {banner.title}
            </h2>
            <motion.div 
              className={`${isDesktop ? "w-2.5 h-2.5" : "w-3 h-3"} bg-pink-500 rounded-full`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
          </motion.div>
          
          {/* Location */}
          {banner.subtitle && (
            <motion.div 
              className={`flex items-center gap-1 ${!isDesktop ? "mb-1" : ""}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <MapPin className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white/80">
                {banner.subtitle}
              </span>
            </motion.div>
          )}
          
          {/* Date and time */}
          <motion.div 
            className={`flex items-center ${isDesktop ? "gap-3" : "gap-2"}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className={`${isDesktop ? "text-lg" : "text-xl"} font-bold text-yellow-400`}>
              Domingo
            </span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className={`${isDesktop ? "text-lg" : "text-xl"} font-bold text-yellow-400`}>
                18:30 hrs
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Action button */}
        <motion.div 
          className="ml-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            className={`${
              isDesktop 
                ? "w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600" 
                : "w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600"
            } rounded-full flex items-center justify-center shadow-md`}
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <MapPin className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}