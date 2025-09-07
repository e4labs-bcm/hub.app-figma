# 🔐 Permissions System - Hub.App

Sistema granular de permissões baseado em roles e ações específicas por módulo.

## 🎯 Conceitos Fundamentais

### O que são Permissões?
Permissões são **controles de acesso granulares** que definem:
- Quais módulos o usuário pode acessar
- Que ações pode realizar dentro de cada módulo  
- Nível de visibilidade dos dados
- Funcionalidades administrativas disponíveis

### Hierarquia de Permissões
```
super_admin    # Acesso total à plataforma
├── admin      # Administrador da empresa
├── manager    # Gerente de equipe  
├── user       # Usuário padrão
└── viewer     # Apenas visualização
```

## 🗄️ Estrutura de Dados

### Tabela de Permissões
```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  permission TEXT NOT NULL, -- ex: 'crm.read', 'agenda.write'
  granted_by UUID REFERENCES perfis(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, permission)
);
```

### Convenção de Nomenclatura
```typescript
// Formato: {module}.{action}
const permissions = [
  // Módulos Core
  'settings.read',      // Ver configurações
  'settings.write',     // Editar configurações
  'users.manage',       // Gerenciar usuários
  'appstore.access',    // Acessar loja de apps
  
  // Módulos Específicos
  'crm.read',           // Ver dados do CRM
  'crm.write',          // Editar dados do CRM
  'crm.delete',         // Deletar registros
  'agenda.read',        // Ver agenda
  'agenda.write',       // Criar/editar eventos
  'financeiro.read',    // Ver dados financeiros
  'financeiro.write',   // Editar dados financeiros
  
  // Permissões Administrativas
  'admin.full',         // Acesso total do tenant
  'admin.modules',      // Gerenciar módulos
  'admin.permissions',  // Gerenciar permissões
  'super.platform'      // Super admin (platform-wide)
];
```

## ⚛️ Hook usePermissions

### Implementação
```typescript
// src/hooks/usePermissions.tsx
interface PermissionsContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserPermissions();
    }
  }, [user]);

  const loadUserPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Carregar permissões explícitas
      const { data: userPerms, error } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (error) throw error;

      const explicitPermissions = userPerms?.map(p => p.permission) || [];
      
      // Adicionar permissões baseadas em role
      const rolePermissions = getRolePermissions(user.role);
      
      // Combinar todas as permissões
      const allPermissions = [...new Set([...explicitPermissions, ...rolePermissions])];
      
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    
    // Super admin tem todas as permissões
    if (user.role === 'super_admin') return true;
    
    return permissions.includes(permission);
  }, [permissions, user]);

  const hasAnyPermission = useCallback((perms: string[]) => {
    return perms.some(perm => hasPermission(perm));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((perms: string[]) => {
    return perms.every(perm => hasPermission(perm));
  }, [hasPermission]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
    refetch: loadUserPermissions
  };
}
```

### Permissões por Role
```typescript
function getRolePermissions(role: string): string[] {
  const rolePermissions = {
    super_admin: ['super.platform'], // Permissão especial checked separadamente
    
    admin: [
      'admin.full',
      'settings.read',
      'settings.write', 
      'users.manage',
      'appstore.access',
      'crm.read',
      'crm.write',
      'crm.delete',
      'agenda.read',
      'agenda.write',
      'financeiro.read',
      'financeiro.write'
    ],
    
    manager: [
      'settings.read',
      'appstore.access',
      'crm.read',
      'crm.write',
      'agenda.read', 
      'agenda.write',
      'financeiro.read'
    ],
    
    user: [
      'settings.read',
      'appstore.access',
      'crm.read',
      'agenda.read',
      'agenda.write'
    ],
    
    viewer: [
      'appstore.access',
      'crm.read',
      'agenda.read'
    ]
  };

  return rolePermissions[role as keyof typeof rolePermissions] || [];
}
```

## 🔒 Controle de Acesso nos Componentes

### Higher-Order Component (HOC)
```typescript
interface WithPermissionProps {
  permission: string | string[];
  fallback?: React.ComponentType;
  operator?: 'AND' | 'OR'; // Para múltiplas permissões
}

export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  { permission, fallback: Fallback = AccessDenied, operator = 'OR' }: WithPermissionProps
) {
  return function PermissionWrappedComponent(props: P) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    
    let hasAccess = false;
    
    if (Array.isArray(permission)) {
      hasAccess = operator === 'AND' 
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission);
    } else {
      hasAccess = hasPermission(permission);
    }

    if (!hasAccess) {
      return <Fallback />;
    }

    return <Component {...props} />;
  };
}

// Uso:
const ProtectedSettings = withPermission(SettingsPage, {
  permission: 'settings.write'
});
```

### Component Guard
```typescript
interface PermissionGuardProps {
  permission: string | string[];
  operator?: 'AND' | 'OR';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ 
  permission, 
  operator = 'OR',
  fallback = null,
  children 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return <div>Loading permissions...</div>;
  }

  let hasAccess = false;
  
  if (Array.isArray(permission)) {
    hasAccess = operator === 'AND' 
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Uso:
<PermissionGuard permission="admin.full">
  <AdminPanel />
</PermissionGuard>

<PermissionGuard 
  permission={['crm.read', 'crm.write']} 
  operator="AND"
  fallback={<AccessDenied />}
>
  <CRMEditor />
</PermissionGuard>
```

### Hook Condicional
```typescript
function useConditionalPermission(permission: string) {
  const { hasPermission } = usePermissions();
  
  return {
    canAccess: hasPermission(permission),
    renderIf: (component: React.ReactNode) => 
      hasPermission(permission) ? component : null
  };
}

// Uso:
function ModuleCard({ module }: { module: Module }) {
  const { renderIf } = useConditionalPermission(`${module.nome.toLowerCase()}.read`);
  
  return renderIf(
    <div className="module-card">
      <h3>{module.nome}</h3>
      {/* Card content */}
    </div>
  );
}
```

## 🎛️ Interface de Gerenciamento

### Componente de Gestão de Permissões
```typescript
interface PermissionManagerProps {
  userId: string;
  onPermissionsChange?: () => void;
}

export function PermissionManager({ userId, onPermissionsChange }: PermissionManagerProps) {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { hasPermission } = usePermissions();

  // Só admin pode gerenciar permissões
  if (!hasPermission('admin.permissions')) {
    return <AccessDenied />;
  }

  const togglePermission = async (permission: string) => {
    try {
      setIsLoading(true);
      
      const hasCurrentPermission = userPermissions.includes(permission);
      
      if (hasCurrentPermission) {
        // Remover permissão
        await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', userId)
          .eq('permission', permission);
      } else {
        // Adicionar permissão
        await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            permission,
            granted_by: currentUser.id
          });
      }
      
      // Atualizar lista local
      setUserPermissions(prev => 
        hasCurrentPermission 
          ? prev.filter(p => p !== permission)
          : [...prev, permission]
      );
      
      onPermissionsChange?.();
    } catch (error) {
      console.error('Error toggling permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Gerenciar Permissões</h3>
      
      {Object.entries(permissionCategories).map(([category, permissions]) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
            {category}
          </h4>
          <div className="space-y-2">
            {permissions.map(permission => (
              <div key={permission} className="flex items-center space-x-2">
                <Switch
                  checked={userPermissions.includes(permission)}
                  onCheckedChange={() => togglePermission(permission)}
                  disabled={isLoading}
                />
                <span className="text-sm">{permission}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 🔄 Gerenciamento Backend

### RPC Functions
```sql
-- Conceder permissão
CREATE OR REPLACE FUNCTION grant_permission(
  target_user_id UUID,
  permission_name TEXT,
  expiry_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem está concedendo tem permissão
  IF NOT (
    SELECT role FROM perfis WHERE id = auth.uid() 
  ) IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Conceder permissão
  INSERT INTO user_permissions (
    user_id, 
    tenant_id, 
    permission, 
    granted_by, 
    expires_at
  )
  VALUES (
    target_user_id,
    get_my_tenant_id(),
    permission_name,
    auth.uid(),
    expiry_date
  )
  ON CONFLICT (user_id, permission) 
  DO UPDATE SET 
    is_active = true,
    granted_by = auth.uid(),
    granted_at = NOW(),
    expires_at = expiry_date;
    
  RETURN true;
END;
$$;

-- Revogar permissão
CREATE OR REPLACE FUNCTION revoke_permission(
  target_user_id UUID,
  permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar permissões do usuário atual
  IF NOT (
    SELECT role FROM perfis WHERE id = auth.uid()
  ) IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Revogar permissão
  UPDATE user_permissions 
  SET is_active = false
  WHERE user_id = target_user_id 
    AND permission = permission_name
    AND tenant_id = get_my_tenant_id();
    
  RETURN true;
END;
$$;
```

### Auditoria de Permissões
```sql
-- Tabela de auditoria
CREATE TABLE permission_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES perfis(id),
  permission TEXT NOT NULL,
  action TEXT CHECK (action IN ('granted', 'revoked', 'expired')),
  granted_by UUID REFERENCES perfis(id),
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para auditoria
CREATE OR REPLACE FUNCTION audit_permission_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO permission_audit (
    user_id, permission, action, granted_by, tenant_id
  )
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.permission, OLD.permission),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'granted'
      WHEN TG_OP = 'UPDATE' AND NEW.is_active = false THEN 'revoked'
      ELSE 'modified'
    END,
    COALESCE(NEW.granted_by, OLD.granted_by),
    COALESCE(NEW.tenant_id, OLD.tenant_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER permission_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_permissions
  FOR EACH ROW EXECUTE FUNCTION audit_permission_changes();
```

## 🕒 Permissões Temporárias

### Implementação
```typescript
const grantTemporaryPermission = async (
  userId: string,
  permission: string,
  durationHours: number
) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + durationHours);

  await supabase.rpc('grant_permission', {
    target_user_id: userId,
    permission_name: permission,
    expiry_date: expiresAt.toISOString()
  });
};

// Job para expirar permissões (via Edge Function ou Cron)
const expirePermissions = async () => {
  await supabase
    .from('user_permissions')
    .update({ is_active: false })
    .lt('expires_at', new Date().toISOString())
    .eq('is_active', true);
};
```

## 📊 Dashboard de Permissões

### Interface de Monitoramento
```typescript
function PermissionsDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePermissions: 0,
    expiringSoon: 0
  });

  const { hasPermission } = usePermissions();

  if (!hasPermission('admin.permissions')) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard de Permissões</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium">Usuários Ativos</h3>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium">Permissões Ativas</h3>
            <p className="text-2xl font-bold">{stats.activePermissions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium">Expirando em 7 dias</h3>
            <p className="text-2xl font-bold">{stats.expiringSoon}</p>
          </CardContent>
        </Card>
      </div>
      
      <PermissionsTable />
    </div>
  );
}
```

---

## 📚 Recursos Relacionados

- [Authentication](./authentication.md) - Sistema de autenticação
- [Multi-tenancy](./multi-tenancy.md) - Arquitetura multi-tenant
- [Database Schema](./database-schema.md) - Schema do banco
- [Modules System](./modules-system.md) - Sistema de módulos