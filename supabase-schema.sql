-- HUB.APP - SCHEMA PART 1: CORE TABLES AND EXTENSIONS
-- Execute este arquivo primeiro no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. EXTENSÕES E CONFIGURAÇÕES INICIAIS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. FUNÇÕES UTILITÁRIAS CORE
-- =====================================================

-- Função para obter tenant_id do usuário logado
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

-- Função para trigger de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. TABELAS CORE
-- =====================================================

-- Tabela de tenants (empresas)
CREATE TABLE IF NOT EXISTS tenants (
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

-- Tabela de perfis (usuários)
CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'funcionario' CHECK (role IN ('super_admin', 'admin_empresa', 'funcionario', 'cliente')),
  nome_completo TEXT NOT NULL CHECK (LENGTH(nome_completo) >= 2),
  avatar_url TEXT,
  configuracoes_pessoais JSONB DEFAULT '{}',
  preferencias_dashboard JSONB DEFAULT '{}',
  ultimo_acesso TIMESTAMPTZ,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  locale TEXT DEFAULT 'pt_BR',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Tabela de convites
CREATE TABLE IF NOT EXISTS convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email_convidado TEXT NOT NULL,
  role_convidado TEXT NOT NULL CHECK (role_convidado IN ('admin_empresa', 'funcionario', 'cliente')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'expirado', 'cancelado')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  enviado_por UUID REFERENCES perfis(id),
  aceito_por UUID REFERENCES perfis(id),
  aceito_at TIMESTAMPTZ,
  mensagem_personalizada TEXT,
  tentativas_envio INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de módulos
CREATE TABLE IF NOT EXISTS modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT UNIQUE NOT NULL CHECK (LENGTH(nome) >= 2),
  slug TEXT UNIQUE NOT NULL,
  descricao TEXT,
  descricao_longa TEXT,
  icone_url TEXT,
  screenshots TEXT[],
  link_destino TEXT NOT NULL,
  is_free BOOLEAN DEFAULT false,
  preco_mensal DECIMAL(10,2) CHECK (preco_mensal IS NULL OR preco_mensal >= 0),
  categoria TEXT DEFAULT 'outros' CHECK (categoria IN ('vendas', 'financeiro', 'produtividade', 'comunicacao', 'marketing', 'recursos_humanos', 'outros')),
  tags TEXT[],
  versao TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'beta', 'coming_soon')),
  manifest JSONB DEFAULT '{}',
  requisitos_minimos JSONB DEFAULT '{}',
  desenvolvedor TEXT,
  site_desenvolvedor TEXT,
  suporte_email TEXT,
  avaliacao_media DECIMAL(2,1) CHECK (avaliacao_media IS NULL OR (avaliacao_media >= 0 AND avaliacao_media <= 5)),
  total_instalacoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ÍNDICES BÁSICOS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_cnpj ON tenants(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_perfis_tenant_id ON perfis(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_perfis_role ON perfis(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_convites_token ON convites(token) WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS idx_convites_email ON convites(email_convidado);
CREATE INDEX IF NOT EXISTS idx_modulos_categoria ON modulos(categoria) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_modulos_slug ON modulos(slug) WHERE status = 'active';

-- =====================================================
-- 5. TRIGGERS BÁSICOS
-- =====================================================

CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perfis_updated_at 
  BEFORE UPDATE ON perfis 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_convites_updated_at 
  BEFORE UPDATE ON convites 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modulos_updated_at 
  BEFORE UPDATE ON modulos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- HUB.APP - SCHEMA PART 2: MODULES, PERMISSIONS & SECURITY
-- Execute este arquivo após o Part 1
-- =====================================================

-- =====================================================
-- 6. TABELAS DE MÓDULOS E PERMISSÕES
-- =====================================================

-- Tabela de relacionamento tenant-módulo
CREATE TABLE IF NOT EXISTS tenants_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  data_instalacao TIMESTAMPTZ DEFAULT NOW(),
  data_expiracao TIMESTAMPTZ,
  configuracoes JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trial', 'expired', 'suspended', 'cancelled')),
  subscription_item_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, modulo_id)
);

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL CHECK (LENGTH(codigo) >= 2),
  nome TEXT NOT NULL CHECK (LENGTH(nome) >= 2),
  descricao TEXT,
  categoria TEXT DEFAULT 'basic' CHECK (categoria IN ('basic', 'advanced', 'admin')),
  grupo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(modulo_id, codigo)
);

-- Tabela de permissões por perfil
CREATE TABLE IF NOT EXISTS perfil_permissoes (
  perfil_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  permissao_id UUID REFERENCES permissoes(id) ON DELETE CASCADE,
  concedida_por UUID REFERENCES perfis(id),
  data_expiracao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (perfil_id, permissao_id)
);

-- Tabela para tokens de módulos externos
CREATE TABLE IF NOT EXISTS module_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
  token_name TEXT,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  ip_whitelist INET[],
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES perfis(id),
  UNIQUE(tenant_id, modulo_id, token_name)
);

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES perfis(id),
  modulo TEXT,
  acao TEXT NOT NULL CHECK (LENGTH(acao) >= 2),
  entidade TEXT,
  entidade_id UUID,
  detalhes JSONB DEFAULT '{}',
  dados_antigos JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  sessao_id TEXT,
  nivel TEXT DEFAULT 'info' CHECK (nivel IN ('debug', 'info', 'warn', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL CHECK (LENGTH(titulo) >= 1),
  mensagem TEXT NOT NULL,
  tipo TEXT DEFAULT 'info' CHECK (tipo IN ('info', 'success', 'warning', 'error')),
  acao_url TEXT,
  acao_texto TEXT,
  lida BOOLEAN DEFAULT false,
  lida_em TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ÍNDICES ADICIONAIS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tenants_modulos_tenant ON tenants_modulos(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tenants_modulos_modulo ON tenants_modulos(modulo_id, status);
CREATE INDEX IF NOT EXISTS idx_permissoes_modulo ON permissoes(modulo_id);
CREATE INDEX IF NOT EXISTS idx_perfil_permissoes_perfil ON perfil_permissoes(perfil_id);
CREATE INDEX IF NOT EXISTS idx_module_tokens_token ON module_tokens(token) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_module_tokens_tenant ON module_tokens(tenant_id, modulo_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_date ON audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_date ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida ON notificacoes(user_id, lida, created_at DESC);

-- =====================================================
-- 8. TRIGGERS ADICIONAIS
-- =====================================================

CREATE TRIGGER update_tenants_modulos_updated_at 
  BEFORE UPDATE ON tenants_modulos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. POLÍTICAS RLS
-- =====================================================

-- Política para tenants
CREATE POLICY "tenant_access" ON tenants
FOR ALL USING (
  id = get_my_tenant_id() AND 
  deleted_at IS NULL
);

-- Política para perfis
CREATE POLICY "perfil_select" ON perfis
FOR SELECT USING (
  (tenant_id = get_my_tenant_id() AND deleted_at IS NULL) OR 
  id = auth.uid()
);

CREATE POLICY "perfil_update_own" ON perfis
FOR UPDATE USING (
  id = auth.uid() AND 
  deleted_at IS NULL
);

-- Política para convites
CREATE POLICY "convites_tenant_access" ON convites
FOR ALL USING (
  tenant_id = get_my_tenant_id()
);

-- Política para módulos (leitura pública)
CREATE POLICY "modulo_public_read" ON modulos
FOR SELECT USING (
  status = 'active'
);

-- Política para tenants_modulos
CREATE POLICY "tenant_modulo_access" ON tenants_modulos
FOR ALL USING (
  tenant_id = get_my_tenant_id()
);

-- Política para permissões (leitura pública)
CREATE POLICY "permissao_public_read" ON permissoes
FOR SELECT USING (true);

-- Política para perfil_permissoes
CREATE POLICY "perfil_permissoes_tenant_access" ON perfil_permissoes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM perfis p 
    WHERE p.id = perfil_id 
    AND p.tenant_id = get_my_tenant_id()
    AND p.deleted_at IS NULL
  )
);

-- Política para module_tokens
CREATE POLICY "module_tokens_tenant_access" ON module_tokens
FOR ALL USING (
  tenant_id = get_my_tenant_id()
);

-- Política para audit_log
CREATE POLICY "audit_log_tenant_access" ON audit_log
FOR SELECT USING (
  tenant_id = get_my_tenant_id()
);

-- Política para notificações
CREATE POLICY "notificacoes_user_access" ON notificacoes
FOR ALL USING (
  user_id = auth.uid() OR 
  tenant_id = get_my_tenant_id()
);


-- HUB.APP - SCHEMA PART 3: RPC FUNCTIONS AND VIEWS
-- Execute este arquivo por último
-- =====================================================

-- =====================================================
-- 11. FUNÇÕES RPC PRINCIPAIS
-- =====================================================

-- Função para verificar permissão específica
CREATE OR REPLACE FUNCTION user_has_permission(permission_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM perfil_permissoes pp
    JOIN permissoes p ON pp.permissao_id = p.id
    JOIN perfis pf ON pp.perfil_id = pf.id
    WHERE pf.id = auth.uid()
    AND p.codigo = permission_code
    AND pf.deleted_at IS NULL
    AND pf.status = 'active'
    AND (pp.data_expiracao IS NULL OR pp.data_expiracao > NOW())
  ) OR EXISTS (
    SELECT 1 FROM perfis 
    WHERE id = auth.uid() 
    AND role = 'super_admin' 
    AND deleted_at IS NULL
  );
END;
$$;

-- Função para criar novo tenant
CREATE OR REPLACE FUNCTION create_new_tenant(
  p_nome_empresa TEXT,
  p_cnpj TEXT DEFAULT NULL,
  p_email_empresa TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  user_email TEXT;
BEGIN
  -- Verificar se usuário já tem empresa
  IF EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Usuário já possui uma empresa vinculada';
  END IF;

  -- Validar dados
  IF LENGTH(TRIM(p_nome_empresa)) < 2 THEN
    RAISE EXCEPTION 'Nome da empresa deve ter pelo menos 2 caracteres';
  END IF;

  -- Obter dados do usuário
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  user_name := COALESCE(SPLIT_PART(user_email, '@', 1), 'Administrador');

  -- Criar tenant
  INSERT INTO tenants (
    nome_empresa, 
    cnpj, 
    email_empresa, 
    status, 
    trial_ends_at
  )
  VALUES (
    TRIM(p_nome_empresa), 
    p_cnpj, 
    COALESCE(p_email_empresa, user_email),
    'trial',
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO new_tenant_id;

  -- Criar perfil admin
  INSERT INTO perfis (id, tenant_id, role, nome_completo)
  VALUES (auth.uid(), new_tenant_id, 'admin_empresa', user_name);

  -- Instalar módulos gratuitos
  INSERT INTO tenants_modulos (tenant_id, modulo_id, status)
  SELECT new_tenant_id, id, 'active'
  FROM modulos
  WHERE is_free = true AND status = 'active';

  -- Conceder permissões básicas
  INSERT INTO perfil_permissoes (perfil_id, permissao_id, concedida_por)
  SELECT auth.uid(), p.id, auth.uid()
  FROM permissoes p
  JOIN modulos m ON p.modulo_id = m.id
  JOIN tenants_modulos tm ON tm.modulo_id = m.id
  WHERE tm.tenant_id = new_tenant_id
  AND tm.status = 'active'
  ON CONFLICT (perfil_id, permissao_id) DO NOTHING;

  -- Log de auditoria
  INSERT INTO audit_log (tenant_id, user_id, acao, entidade, detalhes)
  VALUES (
    new_tenant_id,
    auth.uid(),
    'CREATE',
    'tenant',
    json_build_object(
      'tenant_name', p_nome_empresa,
      'trial_ends', NOW() + INTERVAL '30 days'
    )
  );

  RETURN json_build_object(
    'success', true,
    'tenant_id', new_tenant_id,
    'trial_ends_at', NOW() + INTERVAL '30 days',
    'message', 'Empresa criada com sucesso'
  );
END;
$$;

-- Função para validar token de módulo externo
CREATE OR REPLACE FUNCTION validate_module_token(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_info RECORD;
  tenant_info RECORD;
  module_info RECORD;
BEGIN
  -- Buscar token ativo
  SELECT * INTO token_info
  FROM module_tokens mt
  WHERE mt.token = p_token
  AND mt.is_active = true
  AND (mt.expires_at IS NULL OR mt.expires_at > NOW());

  IF token_info IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Token inválido ou expirado'
    );
  END IF;

  -- Verificar tenant ativo
  SELECT * INTO tenant_info
  FROM tenants t
  WHERE t.id = token_info.tenant_id
  AND t.deleted_at IS NULL
  AND t.status IN ('active', 'trial');

  IF tenant_info IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Empresa não está ativa'
    );
  END IF;

  -- Verificar módulo ativo
  SELECT * INTO module_info
  FROM modulos m
  WHERE m.id = token_info.modulo_id
  AND m.status = 'active';

  IF module_info IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Módulo não está ativo'
    );
  END IF;

  -- Verificar instalação do módulo
  IF NOT EXISTS (
    SELECT 1 FROM tenants_modulos tm
    WHERE tm.tenant_id = token_info.tenant_id
    AND tm.modulo_id = token_info.modulo_id
    AND tm.status IN ('active', 'trial')
    AND (tm.data_expiracao IS NULL OR tm.data_expiracao > NOW())
  ) THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Módulo não está instalado ou expirado para esta empresa'
    );
  END IF;

  -- Atualizar estatísticas do token
  UPDATE module_tokens
  SET last_used_at = NOW(), usage_count = usage_count + 1
  WHERE id = token_info.id;

  RETURN json_build_object(
    'valid', true,
    'tenant_id', token_info.tenant_id,
    'tenant_name', tenant_info.nome_empresa,
    'module_id', token_info.modulo_id,
    'module_name', module_info.nome,
    'permissions', COALESCE(token_info.permissions, ARRAY[]::TEXT[]),
    'token_name', token_info.token_name
  );
END;
$$;

-- Função para registrar módulos externos
CREATE OR REPLACE FUNCTION register_module(
  p_nome TEXT,
  p_descricao TEXT,
  p_icone_url TEXT,
  p_link_destino TEXT,
  p_is_free BOOLEAN DEFAULT true,
  p_preco_mensal DECIMAL(10,2) DEFAULT NULL,
  p_categoria TEXT DEFAULT 'outros',
  p_manifest JSONB DEFAULT '{}'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_module_id UUID;
  module_slug TEXT;
BEGIN
  -- Validar dados
  IF LENGTH(TRIM(p_nome)) < 2 THEN
    RAISE EXCEPTION 'Nome do módulo deve ter pelo menos 2 caracteres';
  END IF;

  -- Gerar slug único
  module_slug := lower(regexp_replace(trim(p_nome), '[^a-zA-Z0-9]+', '-', 'g'));
  module_slug := trim(module_slug, '-');
  
  IF EXISTS (SELECT 1 FROM modulos WHERE slug = module_slug) THEN
    module_slug := module_slug || '-' || extract(epoch from now())::integer;
  END IF;

  -- Criar módulo
  INSERT INTO modulos (
    nome, 
    slug,
    descricao, 
    icone_url, 
    link_destino, 
    is_free, 
    preco_mensal, 
    categoria, 
    manifest,
    status
  )
  VALUES (
    TRIM(p_nome), 
    module_slug,
    p_descricao, 
    p_icone_url, 
    p_link_destino, 
    p_is_free, 
    p_preco_mensal, 
    p_categoria, 
    p_manifest,
    'active'
  )
  RETURNING id INTO new_module_id;

  -- Log de auditoria
  INSERT INTO audit_log (tenant_id, acao, entidade, entidade_id, detalhes)
  VALUES (
    NULL,
    'REGISTER',
    'module',
    new_module_id,
    json_build_object(
      'module_name', p_nome,
      'is_free', p_is_free,
      'categoria', p_categoria
    )
  );

  RETURN json_build_object(
    'success', true,
    'module_id', new_module_id,
    'slug', module_slug,
    'message', 'Módulo registrado com sucesso'
  );
END;
$$;

-- Função para registrar permissões de módulos
CREATE OR REPLACE FUNCTION register_module_permissions(
  p_module_name TEXT,
  p_permissions JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  module_id UUID;
  permission JSONB;
  permissions_created INT := 0;
  permission_code TEXT;
BEGIN
  -- Buscar módulo
  SELECT id INTO module_id FROM modulos WHERE nome = p_module_name AND status = 'active';
  
  IF module_id IS NULL THEN
    RAISE EXCEPTION 'Módulo não encontrado ou inativo: %', p_module_name;
  END IF;

  -- Validar formato
  IF NOT jsonb_typeof(p_permissions) = 'array' THEN
    RAISE EXCEPTION 'Permissões devem ser fornecidas como array JSON';
  END IF;

  -- Processar cada permissão
  FOR permission IN SELECT * FROM jsonb_array_elements(p_permissions)
  LOOP
    IF NOT (permission ? 'codigo' AND permission ? 'nome') THEN
      RAISE EXCEPTION 'Cada permissão deve ter os campos "codigo" e "nome"';
    END IF;

    permission_code := p_module_name || '.' || (permission->>'codigo');

    INSERT INTO permissoes (modulo_id, codigo, nome, descricao, categoria, grupo)
    VALUES (
      module_id,
      permission_code,
      permission->>'nome',
      permission->>'descricao',
      COALESCE(permission->>'categoria', 'basic'),
      permission->>'grupo'
    )
    ON CONFLICT (modulo_id, codigo) DO UPDATE SET
      nome = EXCLUDED.nome,
      descricao = EXCLUDED.descricao,
      categoria = EXCLUDED.categoria,
      grupo = EXCLUDED.grupo;
    
    permissions_created := permissions_created + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'module_id', module_id,
    'permissions_created', permissions_created,
    'message', 'Permissões registradas com sucesso'
  );
END;
$$;

-- =====================================================
-- 12. VIEWS ÚTEIS
-- =====================================================

-- View dos módulos ativos do usuário
CREATE VIEW my_active_modules AS
SELECT 
  m.id,
  m.nome,
  m.slug,
  m.descricao,
  m.icone_url,
  m.link_destino,
  m.categoria,
  m.manifest,
  tm.status as installation_status,
  tm.data_expiracao,
  tm.configuracoes,
  CASE 
    WHEN tm.data_expiracao IS NULL THEN true
    WHEN tm.data_expiracao > NOW() THEN true
    ELSE false
  END as is_active
FROM modulos m
JOIN tenants_modulos tm ON m.id = tm.modulo_id
WHERE tm.tenant_id = get_my_tenant_id()
AND tm.status IN ('active', 'trial')
AND m.status = 'active';

-- View das permissões do usuário atual
CREATE VIEW my_permissions AS
SELECT 
  p.id,
  p.modulo_id,
  p.codigo,
  p.nome,
  p.descricao,
  p.categoria,
  m.nome as modulo_nome
FROM permissoes p
JOIN modulos m ON p.modulo_id = m.id
JOIN perfil_permissoes pp ON p.id = pp.permissao_id
WHERE pp.perfil_id = auth.uid()
AND (pp.data_expiracao IS NULL OR pp.data_expiracao > NOW());

-- =====================================================
-- 13. DADOS SEED INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir módulos padrão gratuitos
INSERT INTO modulos (nome, slug, descricao, icone_url, link_destino, is_free, categoria, status) VALUES
('CRM', 'crm', 'Gestão de contatos e relacionamento com clientes', '/icons/crm.
