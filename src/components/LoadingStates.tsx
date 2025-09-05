import { motion } from 'framer-motion';
import { Loader2, Package, ShoppingBag, Grid3X3 } from 'lucide-react';

// Loading para grid de apps
export function AppGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3 justify-items-center">
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={`app-skeleton-${index}`}
          className="flex flex-col items-center space-y-2"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
        >
          <div className="w-14 h-14 bg-white/10 rounded-2xl animate-pulse" />
          <div className="w-12 h-3 bg-white/10 rounded animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
}

// Loading para sidebar de apps
export function AppSidebarSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={`sidebar-skeleton-${index}`}
          className="flex items-center gap-3 p-3 rounded-lg"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.15 }}
        >
          <div className="w-8 h-8 bg-white/10 rounded-xl animate-pulse" />
          <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
}

// Loading para cards de módulos
export function ModuleCardSkeleton() {
  return (
    <motion.div
      className="p-4 border border-gray-100 rounded-2xl bg-white"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </motion.div>
  );
}

// Loading para grid de cards de módulos
export function ModuleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ModuleCardSkeleton key={`module-skeleton-${index}`} />
      ))}
    </div>
  );
}

// Loading para lista de notificações
export function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.div
          key={`notification-skeleton-${index}`}
          className="p-4 border border-gray-100 rounded-lg"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Loading para configurações
export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="w-64 h-4 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={`setting-field-${index}`}
            className="space-y-2"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
          >
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse" />
          </motion.div>
        ))}
      </div>

      {/* Action buttons skeleton */}
      <div className="flex justify-end gap-3">
        <div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />
        <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Loading spinner centrado
export function CenteredLoader({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

// Loading para App Store
export function AppStoreSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Featured app skeleton */}
      <motion.div
        className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl p-6"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/30 rounded-2xl animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="w-32 h-6 bg-white/30 rounded animate-pulse" />
            <div className="w-24 h-4 bg-white/30 rounded animate-pulse" />
            <div className="w-full h-4 bg-white/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-full h-10 bg-white/30 rounded-lg animate-pulse mt-6" />
      </motion.div>

      {/* Module cards skeleton */}
      <div className="space-y-4">
        <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={`store-item-${index}`}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
            >
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading para dados vazios
export function EmptyState({ 
  icon: Icon = Package, 
  title = "Nenhum item encontrado", 
  description = "Não há dados para exibir no momento",
  action
}: {
  icon?: any;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Icon className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      {action}
    </motion.div>
  );
}