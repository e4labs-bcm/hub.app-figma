import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface Module {
  id: string;
  nome: string;
  slug?: string; // Module slug for identification
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
  manifest?: any; // JSON manifest data
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
      console.log('📦 DIRETO DO SUPABASE: Carregando módulos instalados do tenant:', tenant.id);

      // Query direta ao Supabase para buscar módulos instalados
      const { data: installedModules, error } = await supabase
        .from('tenants_modulos')
        .select(`
          data_instalacao,
          status,
          modulos (
            id,
            nome,
            slug,
            descricao,
            descricao_longa,
            icone_url,
            manifest,
            categoria,
            is_free,
            preco_mensal,
            desenvolvedor,
            avaliacao_media,
            status,
            link_destino
          )
        `)
        .eq('tenant_id', tenant.id)
        .eq('status', 'active');

      if (error) {
        throw new Error(error.message);
      }

      console.log('📦 Módulos instalados carregados:', installedModules?.length || 0);

      // Converter para formato esperado
      const formattedModules = (installedModules || []).map(item => {
        const module = item.modulos;
        
        // Extrair ícone do manifest se disponível
        let iconName = 'Package'; // fallback
        if (module.manifest) {
          try {
            const manifest = typeof module.manifest === 'string' 
              ? JSON.parse(module.manifest) 
              : module.manifest;
            iconName = manifest.icon || 'Package';
          } catch (e) {
            console.warn('Erro ao parsear manifest do módulo:', module.nome);
          }
        }

        return {
          id: module.id,
          nome: module.nome,
          slug: module.slug, // Include slug for overlay detection
          descricao: module.descricao || module.descricao_longa,
          icone_lucide: iconName,
          categoria: module.categoria,
          is_free: module.is_free,
          preco: module.preco_mensal,
          developer: module.desenvolvedor || "Hub.App Team",
          rating: module.avaliacao_media || 4.5,
          downloads: "1K+", // Valor padrão
          size: "10 MB", // Valor padrão
          status: module.status,
          link_destino: module.link_destino,
          manifest: module.manifest, // Include original manifest data
          installed_at: item.data_instalacao,
          module_status: item.status
        };
      });
      
      setModules(formattedModules);
    } catch (error) {
      console.error('❌ Erro ao carregar módulos ativos:', error);
      setError('Erro ao carregar módulos instalados');
      setModules([]);
    }
  };

  // Carregar módulos disponíveis para instalação
  const loadAvailableModules = async () => {
    if (!isAuthenticated || !tenant) return;
    
    try {
      console.log('🛍️ DIRETO DO SUPABASE: Carregando módulos disponíveis...');

      // Primeiro, buscar IDs dos módulos já instalados
      const { data: installedModulesData, error: installedError } = await supabase
        .from('tenants_modulos')
        .select('modulo_id')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active');

      if (installedError) {
        throw new Error(installedError.message);
      }

      const installedIds = installedModulesData?.map(item => item.modulo_id) || [];
      console.log('📦 IDs de módulos já instalados:', installedIds);

      // Buscar todos os módulos ativos
      const { data: allModules, error } = await supabase
        .from('modulos')
        .select('*')
        .eq('status', 'active');

      if (error) {
        throw new Error(error.message);
      }

      // Filtrar módulos não instalados no JavaScript
      const availableModules = (allModules || []).filter(module => 
        !installedIds.includes(module.id)
      );

      console.log('🛍️ Total de módulos no banco:', allModules?.length || 0);
      console.log('🛍️ Módulos disponíveis (após filtro):', availableModules?.length || 0);

      // Converter para formato esperado
      const formattedModules = (availableModules || []).map(module => {
        // Extrair ícone do manifest se disponível
        let iconName = 'Package'; // fallback
        if (module.manifest) {
          try {
            const manifest = typeof module.manifest === 'string' 
              ? JSON.parse(module.manifest) 
              : module.manifest;
            iconName = manifest.icon || 'Package';
          } catch (e) {
            console.warn('Erro ao parsear manifest do módulo:', module.nome);
          }
        }

        return {
          id: module.id,
          nome: module.nome,
          slug: module.slug, // Include slug for overlay detection
          descricao: module.descricao || module.descricao_longa,
          icone_lucide: iconName,
          categoria: module.categoria,
          is_free: module.is_free,
          preco: module.preco_mensal,
          developer: module.desenvolvedor || "Hub.App Team",
          rating: module.avaliacao_media || 4.5,
          downloads: "1K+", // Valor padrão
          size: "10 MB", // Valor padrão
          status: module.status,
          manifest: module.manifest // Include original manifest data
        };
      });
      
      setAvailableModules(formattedModules);
    } catch (error) {
      console.error('❌ Erro ao carregar módulos disponíveis:', error);
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
      console.log('💾 DIRETO NO SUPABASE: Instalando módulo:', moduleId);

      // Inserir na tabela tenants_modulos
      const { data, error } = await supabase
        .from('tenants_modulos')
        .insert({
          tenant_id: tenant.id,
          modulo_id: moduleId,
          status: 'active',
          data_instalacao: new Date().toISOString()
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este módulo já está instalado');
        }
        throw new Error(error.message);
      }

      console.log('✅ Módulo instalado no banco de dados:', data);
      
      // Recarregar listas para refletir as mudanças
      await Promise.all([loadActiveModules(), loadAvailableModules()]);
      
    } catch (error) {
      console.error('❌ Erro ao instalar módulo:', error);
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
      console.log('💾 DIRETO NO SUPABASE: Desinstalando módulo:', moduleId);

      // Remover da tabela tenants_modulos
      const { error } = await supabase
        .from('tenants_modulos')
        .delete()
        .eq('tenant_id', tenant.id)
        .eq('modulo_id', moduleId);

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Módulo desinstalado do banco de dados');
      
      // Recarregar listas para refletir as mudanças
      await Promise.all([loadActiveModules(), loadAvailableModules()]);
      
    } catch (error) {
      console.error('❌ Erro ao desinstalar módulo:', error);
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