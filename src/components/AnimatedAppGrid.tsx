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
  Loader2,
  Zap,
  Megaphone,
  BarChart3,
  Truck
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
  onModuleOpen?: (moduleUrl: string, moduleName: string) => void;
}

export function AnimatedAppGrid({ isSidebar = false, onAppStoreOpen, onSettingsOpen, onModuleOpen }: AnimatedAppGridProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const { modules, isLoading: modulesLoading } = useModules();
  const { hasPermission } = usePermissions();

  // Função para obter ícone do Lucide
  const getIconComponent = (iconName: string) => {
    const icons = {
      Users, Brain, Heart, UserPlus, Calendar, Baby, Book, UsersRound, 
      MessageCircle, Instagram, Youtube, Headphones, CalendarDays, 
      Music, Sparkles, PauseCircle, ShoppingBag, Settings,
      DollarSign, Package, ShoppingCart, UserCheck, ExternalLink,
      Zap, Megaphone, BarChart3, Truck, Loader2
    };
    return icons[iconName as keyof typeof icons] || Users;
  };

  // Função para obter cor baseada na categoria (match com database schema)
  const getCategoryColor = (category: string) => {
    const colors = {
      vendas: "bg-gradient-to-br from-purple-500 to-purple-700",
      financeiro: "bg-gradient-to-br from-green-500 to-green-700", 
      produtividade: "bg-gradient-to-br from-blue-500 to-blue-700",
      comunicacao: "bg-gradient-to-br from-teal-500 to-teal-700",
      marketing: "bg-gradient-to-br from-pink-500 to-pink-700",
      recursos_humanos: "bg-gradient-to-br from-orange-500 to-orange-700",
      outros: "bg-gradient-to-br from-gray-500 to-gray-700",
      // Manter compatibilidade com categorias antigas
      ecommerce: "bg-gradient-to-br from-purple-500 to-purple-700",
      finance: "bg-gradient-to-br from-green-500 to-green-700", 
      productivity: "bg-gradient-to-br from-blue-500 to-blue-700",
      hr: "bg-gradient-to-br from-orange-500 to-orange-700",
      default: "bg-gradient-to-br from-gray-500 to-gray-700"
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  // Função para obter ícone baseado na categoria (match com database schema)
  const getCategoryIcon = (category: string): string => {
    const icons = {
      vendas: 'ShoppingCart',
      financeiro: 'DollarSign', 
      produtividade: 'Zap',
      comunicacao: 'MessageCircle',
      marketing: 'Megaphone',
      recursos_humanos: 'UserCheck',
      outros: 'Package',
      // Manter compatibilidade com categorias antigas
      ecommerce: 'ShoppingCart',
      finance: 'DollarSign', 
      productivity: 'Zap',
      hr: 'UserCheck'
    };
    return icons[category as keyof typeof icons] || 'Package';
  };

  // Converter módulos em apps
  const moduleApps: AppItem[] = modules
    .filter(module => {
      // TEMPORÁRIO: Se o módulo está instalado, permitir sempre
      // TODO: Restaurar verificação de permissões quando Edge Functions funcionarem
      console.log('🔍 Módulo no sidebar:', module.nome, 'ID:', module.id);
      return true; // Permitir todos os módulos instalados temporariamente
      
      // Código original de permissões (comentado temporariamente)
      /*
      const modulePermission = `${module.nome.toLowerCase().replace(/\s+/g, '_')}.read`;
      const basicPermission = `${module.nome.toLowerCase().replace(/\s+/g, '')}.read`;
      
      // Tentar ambos os formatos de permissão
      return hasPermission(modulePermission) || hasPermission(basicPermission) || hasPermission('modules.read');
      */
    })
    .map(module => {
      // Usar ícone do manifest ou fallback baseado na categoria
      const iconName = module.icone_lucide || getCategoryIcon(module.categoria);
      const IconComponent = getIconComponent(iconName);
      
      return {
        id: module.id,
        icon: <IconComponent className="w-5 h-5 md:w-8 md:h-8 text-white" />,
        label: module.nome,
        bgColor: getCategoryColor(module.categoria),
        onClick: () => {
          console.log('🔍 DEBUG: Clicou no módulo:', module.nome);
          console.log('🔍 DEBUG: Link destino:', module.link_destino);
          console.log('🔍 DEBUG: onModuleOpen existe?', !!onModuleOpen);
          
          if (module.link_destino && onModuleOpen) {
            console.log('✅ DEBUG: Abrindo módulo no viewer interno');
            onModuleOpen(module.link_destino, module.nome);
          } else if (module.link_destino) {
            console.log('⚠️ DEBUG: Fallback - abrindo em nova aba');
            window.open(module.link_destino, '_blank');
          } else {
            console.log('ℹ️ DEBUG: Módulo interno - não implementado ainda');
            console.log(`Abrir módulo interno: ${module.nome}`);
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

  // Combinar apenas módulos reais e apps do sistema
  const allApps = [...moduleApps, ...systemApps];

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
      <AnimatePresence mode="popLayout">
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