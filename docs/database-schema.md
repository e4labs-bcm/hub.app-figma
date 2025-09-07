# 🗄️ Database Schema - Hub.App

O Hub.App utiliza **PostgreSQL via Supabase** com Row Level Security (RLS) para isolamento multi-tenant.

## 🏗️ Visão Geral do Schema

### Estrutura Hierárquica
```
tenants (Empresas)
├── perfis (Usuários)
├── modulos (Módulos disponíveis)  
├── user_modules (Módulos por usuário)
├── user_permissions (Permissões granulares)
├── notifications (Notificações)
└── settings (Configurações)
```

## 📋 Tabelas Principais

### 1. Tenants (Empresas)
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa TEXT NOT NULL CHECK (LENGTH(nome_empresa) >= 2),
  cnpj TEXT UNIQUE,
  email_empresa TEXT,
  telefone TEXT,
  endereco JSONB DEFAULT '{}',
  configuracoes JSONB DEFAULT '{}',
  plano TEXT DEFAULT 'free' CHECK (plano IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
  trial_ends_at TIMESTAMPTZ,
  subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_plano ON tenants(plano);
```

### 2. Perfis (Usuários)
```sql
CREATE TABLE perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  nome_completo TEXT,
  email TEXT,
  avatar_url TEXT,
  telefone TEXT,
  cargo TEXT,
  departamento TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'user', 'viewer')),
  configuracoes JSONB DEFAULT '{}',
  ultimo_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_perfis_tenant_id ON perfis(tenant_id);
CREATE INDEX idx_perfis_email ON perfis(email);
CREATE INDEX idx_perfis_role ON perfis(role);
CREATE UNIQUE INDEX idx_perfis_tenant_email ON perfis(tenant_id, email) WHERE deleted_at IS NULL;
```

### 3. Módulos (Sistema de Módulos)
```sql
CREATE TABLE modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT DEFAULT 'other' CHECK (categoria IN ('core', 'productivity', 'finance', 'ecommerce', 'hr', 'crm', 'social', 'other')),
  icone_lucide TEXT, -- Nome do ícone Lucide React
  cor_gradiente TEXT, -- Classes CSS para gradiente
  link_destino TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false, -- Módulos padrão para novos tenants
  is_active BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  version TEXT DEFAULT '1.0.0',
  requisitos JSONB DEFAULT '{}', -- Requisitos mínimos
  configuracoes JSONB DEFAULT '{}', -- Configurações do módulo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_modulos_categoria ON modulos(categoria);
CREATE INDEX idx_modulos_is_premium ON modulos(is_premium);
CREATE INDEX idx_modulos_is_active ON modulos(is_active);
```

### 4. User Modules (Módulos por Usuário)
```sql
CREATE TABLE user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  configuracoes JSONB DEFAULT '{}',
  instalado_em TIMESTAMPTZ DEFAULT NOW(),
  ultima_utilizacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, modulo_id)
);

-- Índices
CREATE INDEX idx_user_modules_user_id ON user_modules(user_id);
CREATE INDEX idx_user_modules_tenant_id ON user_modules(tenant_id);
CREATE INDEX idx_user_modules_modulo_id ON user_modules(modulo_id);
```

### 5. User Permissions (Permissões Granulares)
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
  
  -- Constraints
  UNIQUE(user_id, permission)
);

-- Índices
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_tenant_id ON user_permissions(tenant_id);
CREATE INDEX idx_user_permissions_permission ON user_permissions(permission);
```

### 6. Notifications (Sistema de Notificações)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'info' CHECK (tipo IN ('info', 'warning', 'success', 'error')),
  titulo TEXT NOT NULL,
  mensagem TEXT,
  icone TEXT, -- Nome do ícone Lucide
  link_destino TEXT,
  is_read BOOLEAN DEFAULT false,
  is_global BOOLEAN DEFAULT false, -- Para todos do tenant
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

## 🔐 Row Level Security (RLS)

### Funções Auxiliares
```sql
-- Obter tenant_id do usuário logado
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT p.tenant_id INTO tenant_id
  FROM perfis p
  WHERE p.id = auth.uid() AND p.deleted_at IS NULL;
  
  RETURN tenant_id;
END;
$$;

-- Verificar se usuário é admin do tenant
CREATE OR REPLACE FUNCTION is_tenant_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT p.role INTO user_role
  FROM perfis p
  WHERE p.id = auth.uid();
  
  RETURN user_role IN ('admin', 'super_admin');
END;
$$;
```

### Políticas RLS
```sql
-- Tenants: Usuários só veem seu próprio tenant
CREATE POLICY "Users can only see their tenant" ON tenants
  FOR ALL USING (id = get_my_tenant_id());

-- Perfis: Usuários só veem perfis do mesmo tenant  
CREATE POLICY "Users can only see profiles from their tenant" ON perfis
  FOR ALL USING (tenant_id = get_my_tenant_id());

-- User Modules: Isolamento por tenant
CREATE POLICY "Users can only see their tenant modules" ON user_modules
  FOR ALL USING (tenant_id = get_my_tenant_id());

-- Permissions: Isolamento por tenant
CREATE POLICY "Users can only see their tenant permissions" ON user_permissions
  FOR ALL USING (tenant_id = get_my_tenant_id());

-- Notifications: Isolamento por tenant
CREATE POLICY "Users can only see their tenant notifications" ON notifications
  FOR ALL USING (tenant_id = get_my_tenant_id());

-- Habilitar RLS em todas as tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;  
ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Módulos são públicos (não precisam RLS)
-- modulos table doesn't need RLS as it's shared across all tenants
```

## 🔧 Stored Procedures (RPC Functions)

### Criar Novo Tenant
```sql
CREATE OR REPLACE FUNCTION create_new_tenant(
  company_name TEXT,
  company_cnpj TEXT DEFAULT NULL,
  company_email TEXT DEFAULT NULL,
  user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  default_modules UUID[];
BEGIN
  -- Criar tenant
  INSERT INTO tenants (nome_empresa, cnpj, email_empresa)
  VALUES (company_name, company_cnpj, company_email)
  RETURNING id INTO new_tenant_id;
  
  -- Atualizar perfil do usuário
  UPDATE perfis 
  SET 
    tenant_id = new_tenant_id,
    role = 'admin',
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Obter módulos padrão
  SELECT ARRAY_AGG(id) INTO default_modules
  FROM modulos 
  WHERE is_default = true AND is_active = true;
  
  -- Instalar módulos padrão
  INSERT INTO user_modules (user_id, modulo_id, tenant_id)
  SELECT user_id, unnest(default_modules), new_tenant_id;
  
  -- Criar permissões básicas para admin
  INSERT INTO user_permissions (user_id, tenant_id, permission)
  VALUES 
    (user_id, new_tenant_id, 'admin.full'),
    (user_id, new_tenant_id, 'settings.manage'),
    (user_id, new_tenant_id, 'appstore.access');
  
  RETURN json_build_object(
    'tenant_id', new_tenant_id,
    'success', true,
    'modules_installed', array_length(default_modules, 1)
  );
END;
$$;
```

### Instalar Módulo para Usuário
```sql
CREATE OR REPLACE FUNCTION install_user_module(
  p_user_id UUID,
  p_modulo_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tenant_id UUID;
  module_exists BOOLEAN;
BEGIN
  -- Obter tenant do usuário
  SELECT tenant_id INTO user_tenant_id
  FROM perfis 
  WHERE id = p_user_id;
  
  -- Verificar se módulo existe e está ativo
  SELECT EXISTS(
    SELECT 1 FROM modulos 
    WHERE id = p_modulo_id AND is_active = true
  ) INTO module_exists;
  
  IF NOT module_exists THEN
    RETURN json_build_object('success', false, 'error', 'Módulo não encontrado');
  END IF;
  
  -- Instalar módulo
  INSERT INTO user_modules (user_id, modulo_id, tenant_id)
  VALUES (p_user_id, p_modulo_id, user_tenant_id)
  ON CONFLICT (user_id, modulo_id) 
  DO UPDATE SET is_active = true, updated_at = NOW();
  
  RETURN json_build_object('success', true);
END;
$$;
```

## 📊 Views Úteis

### Módulos com Estatísticas de Uso
```sql
CREATE VIEW modules_usage_stats AS
SELECT 
  m.id,
  m.nome,
  m.categoria,
  m.is_premium,
  COUNT(um.id) as total_installations,
  COUNT(CASE WHEN um.is_active THEN 1 END) as active_installations,
  COUNT(CASE WHEN um.ultima_utilizacao > NOW() - INTERVAL '30 days' THEN 1 END) as recent_usage
FROM modulos m
LEFT JOIN user_modules um ON m.id = um.modulo_id
GROUP BY m.id, m.nome, m.categoria, m.is_premium;
```

### Dashboard do Tenant
```sql
CREATE VIEW tenant_dashboard AS
SELECT 
  t.id as tenant_id,
  t.nome_empresa,
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT um.modulo_id) as installed_modules,
  COUNT(DISTINCT n.id) FILTER (WHERE n.is_read = false) as unread_notifications,
  t.plano,
  t.status,
  t.created_at
FROM tenants t
LEFT JOIN perfis p ON t.id = p.tenant_id AND p.deleted_at IS NULL
LEFT JOIN user_modules um ON t.id = um.tenant_id AND um.is_active = true
LEFT JOIN notifications n ON t.id = n.tenant_id
GROUP BY t.id, t.nome_empresa, t.plano, t.status, t.created_at;
```

## 🔄 Triggers e Automações

### Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas relevantes
CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perfis_updated_at 
  BEFORE UPDATE ON perfis 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auditoria de Login
```sql
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE perfis 
  SET ultimo_login = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger no auth.users (se permitido pelo Supabase)
```

## 📈 Índices de Performance

### Índices Compostos Essenciais
```sql
-- Performance para queries de módulos por tenant
CREATE INDEX idx_user_modules_tenant_active 
ON user_modules(tenant_id, is_active) 
WHERE is_active = true;

-- Performance para notificações não lidas
CREATE INDEX idx_notifications_user_unread 
ON notifications(user_id, is_read) 
WHERE is_read = false;

-- Performance para perfis ativos por tenant
CREATE INDEX idx_perfis_tenant_active 
ON perfis(tenant_id, is_active) 
WHERE is_active = true AND deleted_at IS NULL;
```

## 🗑️ Soft Delete Pattern

### Implementação
```sql
-- Função para soft delete
CREATE OR REPLACE FUNCTION soft_delete_record(
  table_name TEXT,
  record_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = NOW() WHERE id = $1', table_name)
  USING record_id;
  
  RETURN true;
END;
$$;
```

## 📋 Migrations Exemplo

### Estrutura de Migration
```sql
-- Migration: 001_create_base_schema.sql
-- Up
CREATE TABLE tenants (...);
CREATE TABLE perfis (...);
-- Policies, indexes, etc.

-- Down  
DROP TABLE IF EXISTS perfis;
DROP TABLE IF EXISTS tenants;
```

---

## 📚 Recursos Relacionados

- [Multi-tenancy](./multi-tenancy.md)
- [Supabase Setup](./supabase-setup.md)
- [RLS Policies](./rls-policies.md)
- [Authentication](./authentication.md)