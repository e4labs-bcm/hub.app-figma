import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import React from 'react';
import { 
  X, 
  Search, 
  Star, 
  Download, 
  Smartphone,
  Gamepad2,
  BookOpen,
  Heart,
  Camera,
  Music,
  Zap,
  ArrowLeft,
  Share,
  Flag,
  ShoppingBag,
  DollarSign,
  Package,
  ShoppingCart,
  UserCheck,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { useModules } from '../hooks/useModules';
import { usePermissions } from '../hooks/usePermissions';
import { toast } from 'sonner@2.0.3';

interface ModuleApp {
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

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface AppStoreProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function AppStore({ isOpen, onClose, isMobile = true }: AppStoreProps) {
  const [activeTab, setActiveTab] = useState<'featured' | 'categories' | 'search'>('featured');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<ModuleApp | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);
  
  const { availableModules, installModule, isLoading } = useModules();
  const { hasPermission } = usePermissions();

  // Função para obter ícone do Lucide
  const getIconComponent = (iconName?: string) => {
    const icons = {
      DollarSign, Package, ShoppingCart, UserCheck, Zap, 
      Gamepad2, BookOpen, Heart, Camera, Music, ExternalLink
    };
    if (!iconName) return ShoppingBag;
    return icons[iconName as keyof typeof icons] || ShoppingBag;
  };

  const categories: Category[] = [
    { id: 'productivity', name: 'Produtividade', icon: <Zap className="w-6 h-6" />, color: 'bg-blue-500' },
    { id: 'finance', name: 'Financeiro', icon: <DollarSign className="w-6 h-6" />, color: 'bg-green-500' },
    { id: 'ecommerce', name: 'E-commerce', icon: <ShoppingCart className="w-6 h-6" />, color: 'bg-purple-500' },
    { id: 'hr', name: 'Recursos Humanos', icon: <UserCheck className="w-6 h-6" />, color: 'bg-orange-500' },
    { id: 'entertainment', name: 'Entretenimento', icon: <Gamepad2 className="w-6 h-6" />, color: 'bg-pink-500' },
    { id: 'education', name: 'Educação', icon: <BookOpen className="w-6 h-6" />, color: 'bg-indigo-500' }
  ];

  // Usar módulos reais do hook
  const freeModules = availableModules.filter(m => m.is_free);
  const paidModules = availableModules.filter(m => !m.is_free);
  const featuredApp = availableModules[0]; // Primeiro módulo como destaque

  // Função para instalar módulo
  const handleInstall = async (moduleId: string) => {
    if (!hasPermission('modules.install')) {
      toast.error('Você não tem permissão para instalar módulos');
      return;
    }

    setInstalling(moduleId);
    try {
      await installModule(moduleId);
      toast.success('Módulo instalado com sucesso!');
      // Fechar detalhes após instalação
      setSelectedApp(null);
    } catch (error) {
      console.error('Erro ao instalar módulo:', error);
      toast.error('Erro ao instalar módulo. Tente novamente.');
    } finally {
      setInstalling(null);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedApp(null);
  };

  const handleBackToApps = () => {
    setSelectedApp(null);
  };

  const renderFeatured = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4">
        <h2 className="text-2xl font-medium text-gray-900 mb-2">Módulos em Destaque</h2>
        <p className="text-gray-600">Módulos recomendados para sua empresa</p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Carregando módulos...</span>
        </div>
      )}

      {/* No modules available */}
      {!isLoading && availableModules.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum módulo disponível no momento</p>
        </div>
      )}

      {/* Featured App Card */}
      {featuredApp && (
        <motion.div 
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              {React.createElement(getIconComponent(featuredApp.icone_lucide), {
                className: "w-8 h-8 text-white"
              })}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-medium mb-1">{featuredApp.nome}</h3>
              <p className="text-white/80 text-sm mb-3">Editor de Escolha</p>
              <p className="text-white/90 text-sm leading-relaxed">
                {featuredApp.descricao}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setSelectedApp(featuredApp)}
            className="w-full mt-6 bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Ver Detalhes
          </Button>
        </motion.div>
      )}

      {/* Apps Grid */}
      {availableModules.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Novos Módulos</h3>
          <div className="space-y-3">
            {availableModules.slice(1).map((module) => {
              const IconComponent = getIconComponent(module.icone_lucide);
              return (
                <motion.div
                  key={module.id}
                  onClick={() => setSelectedApp(module)}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{module.nome}</h4>
                    <p className="text-sm text-gray-600 truncate">{module.developer || 'Hub.App Team'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{module.rating || '5.0'}</span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">{module.downloads || 'Novo'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {module.is_free ? 'Grátis' : `R$ ${module.preco?.toFixed(2)}`}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {categories.find(c => c.id === module.categoria)?.name || module.categoria}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <h2 className="text-2xl font-medium text-gray-900 mb-2">Categorias</h2>
        <p className="text-gray-600">Explore módulos por categoria</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => {
          const categoryModules = availableModules.filter(m => m.categoria === category.id);
          const moduleCount = categoryModules.length;
          
          return (
            <motion.div
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${category.color} rounded-2xl p-6 text-white cursor-pointer relative overflow-hidden`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center text-center">
                {category.icon}
                <span className="mt-3 font-medium">{category.name}</span>
                <span className="mt-1 text-sm text-white/80">
                  {moduleCount} módulo{moduleCount !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Decorative element */}
              <motion.div 
                className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Show modules in selected category */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedCategory(null)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-medium text-gray-900">
              {categories.find(c => c.id === selectedCategory)?.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableModules
              .filter(module => module.categoria === selectedCategory)
              .map((module) => (
                <div
                  key={module.id}
                  onClick={() => setSelectedApp(module)}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    {React.createElement(getIconComponent(module.icone_lucide), {
                      className: "w-6 h-6 text-gray-600"
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{module.nome}</h4>
                    <p className="text-sm text-gray-600 truncate">{module.developer || 'Hub.App Team'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-gray-900">
                        {module.is_free ? 'Grátis' : `R$ ${module.preco?.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderAppDetails = () => {
    if (!selectedApp) return null;

    const IconComponent = getIconComponent(selectedApp.icone_lucide);
    const isInstalling = installing === selectedApp.id;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToApps}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-medium text-gray-900">Detalhes do Módulo</h2>
        </div>

        {/* Module Info */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
            <IconComponent className="w-10 h-10 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-medium text-gray-900">{selectedApp.nome}</h3>
            <p className="text-gray-600 mb-2">{selectedApp.developer || 'Hub.App Team'}</p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{selectedApp.rating || '5.0'}</span>
              </div>
              <span className="text-sm text-gray-600">{selectedApp.downloads || 'Novo'} instalações</span>
            </div>
            <Badge variant="secondary" className="bg-gray-100">
              {categories.find(c => c.id === selectedApp.categoria)?.name || selectedApp.categoria}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={() => handleInstall(selectedApp.id)}
            disabled={isInstalling || !hasPermission('modules.install')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isInstalling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Instalando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {selectedApp.is_free ? 'Instalar Grátis' : `Comprar R$ ${selectedApp.preco?.toFixed(2)}`}
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4" />
          </Button>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Sobre este módulo</h4>
          <p className="text-gray-700 leading-relaxed">{selectedApp.descricao}</p>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tamanho</p>
            <p className="font-medium">{selectedApp.size || '15 MB'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Categoria</p>
            <p className="font-medium">{categories.find(c => c.id === selectedApp.categoria)?.name || selectedApp.categoria}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Preço</p>
            <p className="font-medium">{selectedApp.is_free ? 'Grátis' : `R$ ${selectedApp.preco?.toFixed(2)}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium capitalize">{selectedApp.status}</p>
          </div>
        </div>

        {/* Permissions Notice */}
        {!hasPermission('modules.install') && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Sem Permissão</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Você não tem permissão para instalar módulos. Entre em contato com o administrador.
            </p>
          </div>
        )}

        {/* Premium Notice */}
        {!selectedApp.is_free && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Módulo Premium</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Este é um módulo pago. Após a compra, ele estará disponível permanentemente.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const containerClasses = isMobile 
    ? "fixed inset-0 z-50 flex items-center"
    : "fixed inset-0 z-50 flex items-center justify-center p-6";

  const contentClasses = isMobile
    ? "w-full h-[70vh] bg-white rounded-3xl shadow-2xl mx-4 mb-[30vh]"
    : "w-full max-w-4xl h-[80vh] bg-white rounded-3xl shadow-2xl";

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        <motion.div
          key="appstore-backdrop"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      </AnimatePresence>

      {/* App Store Content */}
      <AnimatePresence>
        <motion.div
          key="appstore-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={containerClasses}
        >
          {/* Content */}
          <motion.div
            key="appstore-content"
            className={contentClasses}
            initial={isMobile ? { scale: 0.8, opacity: 0, y: 50 } : { scale: 0.9, opacity: 0 }}
            animate={isMobile ? { scale: 1, opacity: 1, y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { scale: 0.8, opacity: 0, y: 50 } : { scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-medium text-gray-900">App Store</h1>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Tabs */}
            {!selectedApp && (
              <div className="flex border-b border-gray-100 flex-shrink-0">
                {[
                  { key: 'featured', label: 'Destaques' },
                  { key: 'categories', label: 'Categorias' },
                  { key: 'search', label: 'Buscar' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Search Bar */}
            {activeTab === 'search' && !selectedApp && (
              <div className="p-6 border-b border-gray-100 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar aplicativos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {selectedApp ? renderAppDetails() : (
                    <>
                      {activeTab === 'featured' && renderFeatured()}
                      {activeTab === 'categories' && renderCategories()}
                      {activeTab === 'search' && (
                        <div className="space-y-6">
                          {searchQuery.length === 0 ? (
                            <div className="text-center py-12">
                              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">Digite algo para buscar módulos</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium text-gray-900">
                                Resultados para "{searchQuery}"
                              </h3>
                              
                              {(() => {
                                const filteredModules = availableModules.filter(module =>
                                  module.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  module.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  module.categoria.toLowerCase().includes(searchQuery.toLowerCase())
                                );

                                if (filteredModules.length === 0) {
                                  return (
                                    <div className="text-center py-12">
                                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                      <p className="text-gray-500">Nenhum módulo encontrado</p>
                                      <p className="text-sm text-gray-400 mt-1">
                                        Tente usar outros termos de busca
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="space-y-3">
                                    {filteredModules.map((module) => {
                                      const IconComponent = getIconComponent(module.icone_lucide);
                                      return (
                                        <motion.div
                                          key={module.id}
                                          onClick={() => setSelectedApp(module)}
                                          className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                                          whileHover={{ scale: 1.01 }}
                                          whileTap={{ scale: 0.99 }}
                                        >
                                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                            <IconComponent className="w-6 h-6 text-gray-600" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">{module.nome}</h4>
                                            <p className="text-sm text-gray-600 truncate line-clamp-2">{module.descricao}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="text-sm font-medium text-gray-900">
                                                {module.is_free ? 'Grátis' : `R$ ${module.preco?.toFixed(2)}`}
                                              </span>
                                              <span className="text-xs text-gray-400">•</span>
                                              <Badge variant="outline" className="text-xs">
                                                {categories.find(c => c.id === module.categoria)?.name || module.categoria}
                                              </Badge>
                                            </div>
                                          </div>
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleInstall(module.id);
                                            }}
                                            disabled={installing === module.id}
                                            size="sm"
                                          >
                                            {installing === module.id ? (
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                              module.is_free ? 'Instalar' : 'Comprar'
                                            )}
                                          </Button>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}