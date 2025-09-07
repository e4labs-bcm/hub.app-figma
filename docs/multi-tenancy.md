# 🏢 Multi-tenancy - Hub.App

O Hub.App implementa uma arquitetura **multi-tenant** que permite isolamento completo de dados entre diferentes empresas/organizações.

## 🎯 Conceitos Fundamentais

### O que é Multi-tenancy?
Multi-tenancy é um padrão arquitetural onde **uma única aplicação serve múltiplos clientes (tenants)** mantendo os dados completamente isolados e seguros.

### Benefícios
- **Economia de recursos** - Uma infraestrutura para todos
- **Escalabilidade** - Adicionar novos clientes é simples
- **Manutenção** - Uma versão da aplicação para manter
- **Segurança** - Isolamento por design

## 🏗️ Implementação no Hub.App

### Modelo de Dados
```
Tenant (Empresa)
├── Users (Usuários da empresa)  
├── Modules (Módulos ativos)
├── Data (Dados da empresa)
└── Settings (Configurações)
```

### Fluxo de Tenant Resolution
```
1. User Login → Supabase Auth
2. Get Profile → tabela `perfis` 
3. Extract tenant_id → Identificador da empresa
4. All Queries → Filtered by tenant_id via RLS
```

## 🗄️ Estrutura do Banco

### Tabelas Principais

#### Tenants (Empresas)
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email_empresa TEXT,
  plano TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Perfis (Usuários)  
```sql
CREATE TABLE perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  nome_completo TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

#### Função Helper
```sql
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT p.tenant_id INTO tenant_id
  FROM perfis p
  WHERE p.id = auth.uid();
  
  RETURN tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Políticas RLS
```sql
-- Exemplo para tabela de módulos
CREATE POLICY "Users can only access their tenant modules"
ON modulos FOR ALL
USING (tenant_id = get_my_tenant_id());

-- Habilitar RLS
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
```

## ⚛️ Implementação no Frontend

### Context de Autenticação
```typescript
export function useAuth() {
  const [authState, setAuthState] = useState({
    user: null as Perfil | null,
    tenant: null as Tenant | null,
    isAuthenticated: false,
    isLoading: true
  });

  // Quando user faz login, obtém tenant automaticamente
  const loadUserProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from('perfis')
      .select('*, tenants(*)')
      .eq('id', userId)
      .single();
    
    setAuthState({
      user: profile,
      tenant: profile.tenants,
      isAuthenticated: true,
      isLoading: false
    });
  };
}
```

### Consultas Automáticas
```typescript
// ✅ RLS filtra automaticamente por tenant_id
const { data: modules } = await supabase
  .from('modulos')
  .select('*');
  
// Não precisa de .eq('tenant_id', tenantId)
// RLS policy já filtra automaticamente!
```

## 🔐 Segurança

### Isolamento de Dados
- **RLS Policies**: Filtram automaticamente por tenant_id
- **JWT Token**: Contém informações do usuário autenticado
- **Function Security**: `SECURITY DEFINER` para functions sensíveis

### Validações
```typescript
// Sempre validar se user tem acesso ao tenant
const hasAccess = user.tenant_id === targetTenantId;
if (!hasAccess) {
  throw new Error('Acesso negado');
}
```

### Proteções Frontend
```typescript
// Guard para componentes sensíveis
function TenantGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user?.tenant_id) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
}
```

## 🚀 Criação de Novos Tenants

### Fluxo de Signup
```typescript
export async function createCompany(data: {
  nome: string;
  cnpj?: string; 
  email?: string;
}) {
  // 1. Criar tenant
  const { data: tenant } = await supabase.rpc('create_new_tenant', {
    company_name: data.nome,
    company_cnpj: data.cnpj,
    company_email: data.email,
    user_id: user.id
  });
  
  // 2. Associar user ao tenant (feito pela RPC function)
  // 3. Criar módulos padrão para o tenant
  // 4. Configurar permissões iniciais
}
```

### RPC Function no Supabase
```sql
CREATE OR REPLACE FUNCTION create_new_tenant(
  company_name TEXT,
  company_cnpj TEXT DEFAULT NULL,
  company_email TEXT DEFAULT NULL,
  user_id UUID
)
RETURNS JSON AS $$
DECLARE
  new_tenant_id UUID;
  user_profile RECORD;
BEGIN
  -- Criar tenant
  INSERT INTO tenants (nome_empresa, cnpj, email_empresa)
  VALUES (company_name, company_cnpj, company_email)
  RETURNING id INTO new_tenant_id;
  
  -- Atualizar perfil do usuário
  UPDATE perfis 
  SET tenant_id = new_tenant_id,
      role = 'admin'
  WHERE id = user_id;
  
  -- Criar módulos padrão
  INSERT INTO user_modules (user_id, modulo_id)
  SELECT user_id, id 
  FROM modulos 
  WHERE is_default = true;
  
  RETURN json_build_object(
    'tenant_id', new_tenant_id,
    'success', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 👥 Gestão de Usuários

### Adicionar Usuário ao Tenant
```typescript
async function inviteUser(email: string, role: string) {
  const { user: currentUser } = useAuth();
  
  // Só admin pode convidar
  if (currentUser.role !== 'admin') {
    throw new Error('Permissão negada');
  }
  
  // Criar convite
  await supabase
    .from('user_invites')
    .insert({
      tenant_id: currentUser.tenant_id,
      email,
      role,
      invited_by: currentUser.id
    });
}
```

### Roles por Tenant
- **super_admin**: Acesso global (gestão da plataforma)  
- **admin**: Administrador da empresa
- **user**: Usuário normal da empresa
- **viewer**: Apenas visualização

## 📊 Métricas e Analytics

### Dados por Tenant
```sql
-- Usuários por tenant
SELECT 
  t.nome_empresa,
  COUNT(p.id) as total_users
FROM tenants t
LEFT JOIN perfis p ON t.id = p.tenant_id
GROUP BY t.id, t.nome_empresa;

-- Módulos mais usados
SELECT 
  m.nome,
  COUNT(um.id) as usage_count
FROM modulos m
JOIN user_modules um ON m.id = um.modulo_id
GROUP BY m.id, m.nome
ORDER BY usage_count DESC;
```

## 🔧 Desenvolvimento e Debug

### Trocar de Tenant (Dev Only)
```typescript
// ⚠️ Apenas para desenvolvimento/testing
async function switchTenant(tenantId: string) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Não permitido em produção');
  }
  
  await supabase
    .from('perfis')
    .update({ tenant_id: tenantId })
    .eq('id', user.id);
}
```

### Logs de Tenant
```typescript
// Sempre logar tenant_id para debugging
console.log('Action performed', {
  user_id: user.id,
  tenant_id: user.tenant_id,
  action: 'create_module'
});
```

## ⚠️ Considerações Importantes

### Performance
- **Índices**: Sempre em colunas tenant_id
- **Queries**: RLS adiciona filtros automáticos
- **Caching**: Cache por tenant quando necessário

### Backup e Recovery
- **Backup por tenant** quando necessário
- **Data retention** configurável por plano
- **Soft deletes** para auditoria

### Compliance
- **LGPD**: Dados isolados por empresa
- **GDPR**: Right to be forgotten por tenant  
- **Auditoria**: Logs de acesso por tenant

---

## 📚 Recursos Relacionados

- [Database Schema](./database-schema.md)
- [Authentication System](./authentication.md)  
- [Permissions System](./permissions.md)
- [Supabase Setup](./supabase-setup.md)