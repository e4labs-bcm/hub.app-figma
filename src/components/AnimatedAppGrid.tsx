import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Brain, 
  Heart, 
  UserPlus,
  Calendar,
  Baby,
  Book,
  UsersRound,
  MessageCircle,
  Instagram,
  Youtube,
  Headphones,
  CalendarDays,
  Music,
  Sparkles,
  PauseCircle,
  ShoppingBag,
  Settings,
  DollarSign,
  Package,
  ShoppingCart,
  UserCheck,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useModules } from '../hooks/useModules';
import { usePermissions } from '../hooks/usePermissions';

interface AppItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  onClick?: () => void;
}

interface AnimatedAppGridProps {
  isSidebar?: boolean;
  onAppStoreOpen?: () => void;
  onSettingsOpen?: () => void;
}

export function AnimatedAppGrid({ isSidebar = false, onAppStoreOpen, onSettingsOpen }: AnimatedAppGridProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const { modules, isLoading: modulesLoading } = useModules();
  const { hasPermission } = usePermissions();

  // Função para obter ícone do Lucide
  const getIconComponent = (iconName: string) => {
    const icons = {
      Users, Brain, Heart, UserPlus, Calendar, Baby, Book, UsersRound, 
      MessageCircle, Instagram, Youtube, Headphones, CalendarDays, 
      Music, Sparkles, PauseCircle, ShoppingBag, Settings,
      DollarSign, Package, ShoppingCart, UserCheck, ExternalLink
    };
    return icons[iconName as keyof typeof icons] || Users;
  };

  // Função para obter cor baseada na categoria
  const getCategoryColor = (category: string) => {
    const colors = {
      productivity: "bg-gradient-to-br from-blue-500 to-blue-700",
      finance: "bg-gradient-to-br from-green-500 to-green-700", 
      ecommerce: "bg-gradient-to-br from-purple-500 to-purple-700",
      hr: "bg-gradient-to-br from-orange-500 to-orange-700",
      crm: "bg-gradient-to-br from-indigo-500 to-indigo-700",
      default: "bg-gradient-to-br from-gray-500 to-gray-700"
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  // Converter módulos em apps
  const moduleApps: AppItem[] = modules
    .filter(module => {
      // Verificar se tem permissão para acessar o módulo
      const readPermission = `${module.nome.toLowerCase()}.read`;
      return hasPermission(readPermission);
    })
    .map(module => {
      const IconComponent = module.icone_lucide ? getIconComponent(module.icone_lucide) : Users;
      
      return {
        id: module.id,
        icon: <IconComponent className="w-5 h-5 md:w-8 md:h-8 text-white" />,
        label: module.nome,
        bgColor: getCategoryColor(module.categoria),
        onClick: () => {
          if (module.link_destino) {
            window.open(module.link_destino, '_blank');
          } else {
            console.log(`Abrir módulo: ${module.nome}`);
          }
        }
      };
    });

  const systemApps: AppItem[] = [
    // App Store - apenas se tiver permissão
    ...(hasPermission('appstore.read') ? [{
      id: "app-store",
      icon: <ShoppingBag className="w-5 h-5 md:w-8 md:h-8 text-white" />,
      label: "App Store",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-700",
      onClick: onAppStoreOpen
    }] : []),
    
    // Configurações - apenas se tiver permissão
    ...(hasPermission('settings.read') ? [{
      id: "settings",
      icon: <Settings className="w-5 h-5 md:w-8 md:h-8 text-white" />,
      label: "Configurações",
      bgColor: "bg-gradient-to-br from-gray-600 to-gray-800",
      onClick: onSettingsOpen
    }] : [])
  ];

  // Apps estáticos de exemplo (manter alguns para demonstração)
  const demoApps: AppItem[] = [
    {
      id: "quem-nos-somos",
      icon: <Users className="w-5 h-5 md:w-8 md:h-8 text-red-600" />,
      label: "Quem Nós Somos",
      bgColor: "bg-yellow-400"
    },
    {
      id: "meditacao",
      icon: <Brain className="w-5 h-5 md:w-8 md:h-8 text-black" />,
      label: "Meditação Semanal",
      bgColor: "bg-white"
    },
    {
      id: "contribua",
      icon: <Heart className="w-5 h-5 md:w-8 md:h-8 text-red-500" />,
      label: "Contribua",
      bgColor: "bg-white"
    },
    {
      id: "instagram",
      icon: <Instagram className="w-5 h-5 md:w-8 md:h-8 text-white" />,
      label: "Insta",
      bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
    },
    {
      id: "youtube",
      icon: <Youtube className="w-5 h-5 md:w-8 md:h-8 text-white" />,
      label: "YouTube",
      bgColor: "bg-red-600"
    }
  ];

  // Combinar todos os apps
  const allApps = [...moduleApps, ...systemApps, ...demoApps];

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Loading skeleton
  if (modulesLoading) {
    return (
      <div className={isSidebar ? "space-y-2" : "grid grid-cols-4 gap-3 justify-items-center"}>
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={`skeleton-${index}`}
            className={
              isSidebar 
                ? "w-full h-12 bg-white/10 rounded-lg animate-pulse" 
                : "w-14 h-14 bg-white/10 rounded-2xl animate-pulse"
            }
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
          />
        ))}
      </div>
    );
  }

  if (isSidebar) {
    // Sidebar layout for desktop
    return (
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.05 }}
      >
        {allApps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.03,
              ease: "easeOut"
            }}
            className="group"
          >
            <motion.button 
              className="w-full hover:bg-white/20 text-white h-auto p-3 justify-start gap-3 flex items-center rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={app.onClick}
            >
              <motion.div 
                className={`
                  w-8 h-8 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0
                  ${app.bgColor}
                `}
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                {app.icon}
              </motion.div>
              <span className="text-sm text-[12px]">{app.label}</span>
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Grid layout for mobile
  return (
    <motion.div 
      className="grid grid-cols-4 gap-3 justify-items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.05 }}
    >
      <AnimatePresence>
        {allApps.map((app, index) => (
          <motion.div 
            key={app.id}
            layout
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.05,
              ease: "easeOut"
            }}
            className="flex flex-col items-center justify-start space-y-1.5 w-full"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center"
              onClick={app.onClick}
            >
              <motion.div 
                className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                  ${app.bgColor}
                `}
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                {app.icon}
              </motion.div>
            </motion.button>
            <motion.span 
              className="text-white text-xs text-center leading-tight px-1 max-w-full"
              style={{ 
                wordBreak: "break-word",
                hyphens: "auto",
                fontSize: "11px",
                lineHeight: "1.2"
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              {app.label}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}