import { motion } from 'framer-motion';
import React from 'react';
import { 
  Star, 
  Download, 
  DollarSign,
  Package,
  ShoppingCart,
  UserCheck,
  Zap,
  Users,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Module {
  id: string;
  nome: string;
  descricao: string;
  icone_lucide?: string;
  categoria: string;
  is_free: boolean;
  preco?: number;
  developer?: string;
  rating?: number;
  downloads?: string;
  size?: string;
  status: string;
}

interface ModuleCardProps {
  module: Module;
  onInstall: () => void;
  onViewDetails: () => void;
  isInstalling: boolean;
  isPaid?: boolean;
}

export function ModuleCard({ 
  module, 
  onInstall, 
  onViewDetails, 
  isInstalling, 
  isPaid = false 
}: ModuleCardProps) {
  
  // Função para obter ícone do Lucide
  const getIconComponent = (iconName?: string) => {
    const icons = {
      DollarSign, Package, ShoppingCart, UserCheck, Zap, Users
    };
    if (!iconName) return Package;
    return icons[iconName as keyof typeof icons] || Package;
  };

  const IconComponent = getIconComponent(module.icone_lucide);

  // Cores baseadas na categoria
  const getCategoryColor = (category: string) => {
    const colors = {
      productivity: "from-blue-500 to-blue-600",
      finance: "from-green-500 to-green-600", 
      ecommerce: "from-purple-500 to-purple-600",
      hr: "from-orange-500 to-orange-600",
      crm: "from-indigo-500 to-indigo-600",
      default: "from-gray-500 to-gray-600"
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Module Icon */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCategoryColor(module.categoria)} flex items-center justify-center flex-shrink-0`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-1 truncate">{module.nome}</h3>
          <p className="text-sm text-gray-600 mb-2">{module.developer || 'Hub.App Team'}</p>
          
          {/* Rating and Downloads */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{module.rating || '5.0'}</span>
            </div>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-600">{module.downloads || 'Novo'}</span>
          </div>

          {/* Category Badge */}
          <Badge variant="secondary" className="text-xs">
            {module.categoria}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
        {module.descricao}
      </p>

      {/* Price */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isPaid && <DollarSign className="w-4 h-4 text-green-600" />}
          <span className="font-medium text-gray-900">
            {module.is_free ? 'Grátis' : `R$ ${module.preco?.toFixed(2)}`}
          </span>
        </div>
        <span className="text-xs text-gray-500">{module.size || '15 MB'}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onInstall}
          disabled={isInstalling}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          size="sm"
        >
          {isInstalling ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Instalando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {module.is_free ? 'Instalar' : 'Comprar'}
            </>
          )}
        </Button>
        <Button
          onClick={onViewDetails}
          variant="outline"
          size="sm"
        >
          Detalhes
        </Button>
      </div>

      {/* Premium Badge */}
      {!module.is_free && (
        <motion.div 
          className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          Premium
        </motion.div>
      )}
    </motion.div>
  );
}