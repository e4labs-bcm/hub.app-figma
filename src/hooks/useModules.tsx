import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from './useAuth';

interface Module {
  id: string;
  nome: string;
  descricao: string;
  icone_url?: string;
  icone_lucide?: string;
  link_destino?: string;
  categoria: string;
  is_free: boolean;
  preco?: number;
  developer?: string;
  rating?: number;
  downloads?: string;
  size?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

interface InstalledModule extends Module {
  installed_at: string;
  module_status: 'active' | 'inactive';
}

interface ModulesContextType {
  modules: InstalledModule[];
  availableModules: Module[];
  isLoading: boolean;
  error: string | null;
  installModule: (moduleId: string) => Promise<void>;
  uninstallModule: (moduleId: string) => Promise<void>;
  refreshModules: () => Promise<void>;
  getModulesByCategory: (category?: string) => Module[];
}

const ModulesContext = createContext<ModulesContextType | null>(null);

export function ModulesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, tenant } = useAuth();
  const [modules, setModules] = useState<InstalledModule[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar módulos ativos do usuário
  const loadActiveModules = async () => {
    if (!isAuthenticated || !tenant) return;
    
    try {
      setError(null);
      console.log('Carregando módulos ativos do tenant:', tenant.id);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/modules/active`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar módulos: ${response.status}`);
      }

      const { modules: activeModules } = await response.json();
      console.log('Módulos ativos carregados:', activeModules?.length || 0);
      
      setModules(activeModules || []);
    } catch (error) {
      console.error('Erro ao carregar módulos ativos:', error);
      setError('Erro ao carregar módulos instalados');
      setModules([]);
    }
  };

  // Carregar módulos disponíveis para instalação
  const loadAvailableModules = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('Carregando módulos disponíveis...');

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/modules/available`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar módulos disponíveis: ${response.status}`);
      }

      const { modules: available } = await response.json();
      console.log('Módulos disponíveis carregados:', available?.length || 0);
      
      setAvailableModules(available || []);
    } catch (error) {
      console.error('Erro ao carregar módulos disponíveis:', error);
      setError('Erro ao carregar módulos disponíveis');
      setAvailableModules([]);
    }
  };

  // Instalar módulo
  const installModule = async (moduleId: string) => {
    if (!isAuthenticated || !tenant) {
      throw new Error('Usuário não autenticado ou sem empresa');
    }

    try {
      setError(null);
      console.log('Instalando módulo:', moduleId);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/modules/install`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          module_id: moduleId,
          tenant_id: tenant.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao instalar módulo');
      }

      const result = await response.json();
      console.log('Módulo instalado com sucesso:', result);
      
      // Recarregar listas
      await Promise.all([loadActiveModules(), loadAvailableModules()]);
      
    } catch (error) {
      console.error('Erro ao instalar módulo:', error);
      setError(error instanceof Error ? error.message : 'Erro ao instalar módulo');
      throw error;
    }
  };

  // Desinstalar módulo
  const uninstallModule = async (moduleId: string) => {
    if (!isAuthenticated || !tenant) {
      throw new Error('Usuário não autenticado ou sem empresa');
    }

    try {
      setError(null);
      console.log('Desinstalando módulo:', moduleId);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/modules/uninstall`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          module_id: moduleId,
          tenant_id: tenant.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao desinstalar módulo');
      }

      console.log('Módulo desinstalado com sucesso');
      
      // Recarregar listas
      await Promise.all([loadActiveModules(), loadAvailableModules()]);
      
    } catch (error) {
      console.error('Erro ao desinstalar módulo:', error);
      setError(error instanceof Error ? error.message : 'Erro ao desinstalar módulo');
      throw error;
    }
  };

  // Atualizar listas
  const refreshModules = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadActiveModules(), loadAvailableModules()]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar módulos por categoria
  const getModulesByCategory = (category?: string) => {
    const allModules = [...modules, ...availableModules];
    if (!category) return allModules;
    return allModules.filter(module => module.categoria === category);
  };

  // Carregar dados inicial
  useEffect(() => {
    if (isAuthenticated && tenant) {
      refreshModules();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, tenant]);

  const value: ModulesContextType = {
    modules,
    availableModules,
    isLoading,
    error,
    installModule,
    uninstallModule,
    refreshModules,
    getModulesByCategory
  };

  return (
    <ModulesContext.Provider value={value}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    console.error('useModules deve ser usado dentro de ModulesProvider');
    // Return default values instead of throwing to prevent crashes
    return {
      modules: [],
      availableModules: [],
      isLoading: false,
      error: null,
      installModule: async () => {},
      uninstallModule: async () => {},
      refreshModules: async () => {},
      getModulesByCategory: () => []
    };
  }
  return context;
}