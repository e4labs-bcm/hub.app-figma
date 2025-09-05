import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from './useAuth';

interface Permission {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  modulo?: string;
}

interface PermissionsContextType {
  permissions: Set<string>;
  isLoading: boolean;
  error: string | null;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  hasAllPermissions: (codes: string[]) => boolean;
  checkPermission: (code: string) => Promise<boolean>;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, tenant } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar permissões do usuário
  const loadPermissions = async () => {
    if (!isAuthenticated || !user || !tenant) {
      setPermissions(new Set());
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Carregando permissões do usuário:', user.id);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/permissions`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar permissões: ${response.status}`);
      }

      const { permissions: userPermissions } = await response.json();
      console.log('Permissões carregadas:', userPermissions?.length || 0);
      
      // Converter para Set para consultas rápidas
      const permissionCodes = new Set(
        userPermissions?.map((p: Permission) => p.codigo) || []
      );
      
      setPermissions(permissionCodes);
      
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setError('Erro ao carregar permissões do usuário');
      setPermissions(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se tem permissão específica
  const hasPermission = (code: string) => {
    return permissions.has(code);
  };

  // Verificar se tem pelo menos uma das permissões
  const hasAnyPermission = (codes: string[]) => {
    return codes.some(code => permissions.has(code));
  };

  // Verificar se tem todas as permissões
  const hasAllPermissions = (codes: string[]) => {
    return codes.every(code => permissions.has(code));
  };

  // Verificar permissão no servidor (para validação crítica)
  const checkPermission = async (code: string) => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/permissions/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permission_code: code,
          user_id: user.id
        })
      });

      if (!response.ok) {
        console.error('Erro ao verificar permissão no servidor');
        return false;
      }

      const { hasPermission: serverHasPermission } = await response.json();
      return serverHasPermission;
      
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  };

  // Recarregar permissões
  const refreshPermissions = async () => {
    setIsLoading(true);
    await loadPermissions();
  };

  // Carregar permissões quando usuário ou tenant mudarem
  useEffect(() => {
    loadPermissions();
  }, [isAuthenticated, user, tenant]);

  const value: PermissionsContextType = {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    refreshPermissions
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    console.error('usePermissions deve ser usado dentro de PermissionsProvider');
    // Return default values instead of throwing to prevent crashes
    return {
      permissions: new Set<string>(),
      isLoading: false,
      error: null,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      checkPermission: async () => false,
      refreshPermissions: async () => {}
    };
  }
  return context;
}