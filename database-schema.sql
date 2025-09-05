-- Database Schema para Hub.App
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar tabela de tenants (empresas)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_empresa TEXT NOT NULL,
    cnpj TEXT,
    email_empresa TEXT,
    telefone TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    website TEXT,
    descricao TEXT,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
    plano TEXT NOT NULL DEFAULT 'free' CHECK (plano IN ('free', 'basico', 'profissional', 'empresarial')),
    max_usuarios INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'user')),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de módulos disponíveis
CREATE TABLE IF NOT EXISTS public.modulos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    icone_lucide TEXT NOT NULL,
    categoria TEXT NOT NULL,
    is_free BOOLEAN NOT NULL DEFAULT true,
    preco DECIMAL(10,2),
    developer TEXT NOT NULL DEFAULT 'Hub.App Team',
    rating DECIMAL(2,1) DEFAULT 4.5,
    downloads TEXT DEFAULT '0',
    size TEXT DEFAULT '1 MB',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    link_destino TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de módulos por tenant (instalados)
CREATE TABLE IF NOT EXISTS public.tenants_modulos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    modulo_id TEXT NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, modulo_id)
);

-- 5. Criar tabela de permissões
CREATE TABLE IF NOT EXISTS public.permissoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    descricao TEXT,
    modulo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela de permissões por perfil
CREATE TABLE IF NOT EXISTS public.perfis_permissoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    perfil_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
    permissao_id UUID NOT NULL REFERENCES public.permissoes(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES public.perfis(id),
    UNIQUE(perfil_id, permissao_id)
);

-- 7. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'success', 'warning', 'error')),
    lida BOOLEAN NOT NULL DEFAULT false,
    lida_em TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar tabela de audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    entidade TEXT NOT NULL,
    entidade_id TEXT,
    detalhes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Inserir módulos padrão
INSERT INTO public.modulos (id, nome, descricao, icone_lucide, categoria, is_free, link_destino) VALUES
('mod_crm', 'CRM', 'Sistema de gestão de relacionamento com clientes', 'Users', 'productivity', true, '#'),
('mod_agenda', 'Agenda', 'Sistema de agendamento e calendário', 'Calendar', 'productivity', true, '#'),
('mod_financeiro', 'Financeiro', 'Gestão financeira completa para sua empresa', 'DollarSign', 'finance', false, '#'),
('mod_estoque', 'Controle de Estoque', 'Gerencie seu estoque com facilidade', 'Package', 'productivity', true, '#'),
('mod_vendas', 'Vendas Online', 'Plataforma de vendas e e-commerce integrada', 'ShoppingCart', 'ecommerce', false, '#'),
('mod_rh', 'Recursos Humanos', 'Gestão completa de recursos humanos', 'UserCheck', 'hr', false, '#')
ON CONFLICT (id) DO NOTHING;

-- 10. Inserir permissões básicas
INSERT INTO public.permissoes (codigo, nome, descricao, modulo) VALUES
('crm.read', 'Visualizar CRM', 'Permite visualizar dados do CRM', 'CRM'),
('crm.write', 'Editar CRM', 'Permite editar dados do CRM', 'CRM'),
('agenda.read', 'Visualizar Agenda', 'Permite visualizar a agenda', 'Agenda'),
('agenda.write', 'Editar Agenda', 'Permite editar a agenda', 'Agenda'),
('settings.read', 'Visualizar Configurações', 'Permite visualizar configurações', 'Sistema'),
('settings.write', 'Editar Configurações', 'Permite editar configurações', 'Sistema'),
('appstore.read', 'Acessar App Store', 'Permite acessar a App Store', 'Sistema'),
('modules.install', 'Instalar Módulos', 'Permite instalar novos módulos', 'Sistema'),
('company.read', 'Visualizar Empresa', 'Permite visualizar dados da empresa', 'Sistema'),
('company.write', 'Editar Empresa', 'Permite editar dados da empresa', 'Sistema')
ON CONFLICT (codigo) DO NOTHING;

-- 11. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers nas tabelas
DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_perfis_updated_at ON public.perfis;
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON public.perfis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modulos_updated_at ON public.modulos;
CREATE TRIGGER update_modulos_updated_at BEFORE UPDATE ON public.modulos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_modulos_updated_at ON public.tenants_modulos;
CREATE TRIGGER update_tenants_modulos_updated_at BEFORE UPDATE ON public.tenants_modulos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Habilitar RLS (Row Level Security)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 13. Criar políticas RLS básicas

-- Políticas para tenants
DROP POLICY IF EXISTS "Tenants são visíveis para membros" ON public.tenants;
CREATE POLICY "Tenants são visíveis para membros" ON public.tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM public.perfis 
            WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins podem atualizar tenants" ON public.tenants;
CREATE POLICY "Admins podem atualizar tenants" ON public.tenants
    FOR UPDATE USING (
        id IN (
            SELECT tenant_id FROM public.perfis 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Políticas para perfis
DROP POLICY IF EXISTS "Perfis são visíveis para membros do mesmo tenant" ON public.perfis;
CREATE POLICY "Perfis são visíveis para membros do mesmo tenant" ON public.perfis
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.perfis 
            WHERE id = auth.uid()
        )
        OR id = auth.uid()
    );

DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.perfis;
CREATE POLICY "Usuários podem ver próprio perfil" ON public.perfis
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins podem atualizar perfis" ON public.perfis;
CREATE POLICY "Admins podem atualizar perfis" ON public.perfis
    FOR UPDATE USING (
        id = auth.uid() 
        OR tenant_id IN (
            SELECT tenant_id FROM public.perfis 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Políticas para módulos (públicos para leitura)
DROP POLICY IF EXISTS "Módulos são públicos para leitura" ON public.modulos;
CREATE POLICY "Módulos são públicos para leitura" ON public.modulos
    FOR SELECT USING (true);

-- Políticas para tenants_modulos
DROP POLICY IF EXISTS "Tenants podem ver seus módulos" ON public.tenants_modulos;
CREATE POLICY "Tenants podem ver seus módulos" ON public.tenants_modulos
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.perfis 
            WHERE id = auth.uid()
        )
    );

-- Políticas para notificações
DROP POLICY IF EXISTS "Usuários podem ver suas notificações" ON public.notificacoes;
CREATE POLICY "Usuários podem ver suas notificações" ON public.notificacoes
    FOR ALL USING (user_id = auth.uid());

-- Políticas para permissões (públicas para leitura)
DROP POLICY IF EXISTS "Permissões são públicas para leitura" ON public.permissoes;
CREATE POLICY "Permissões são públicas para leitura" ON public.permissoes
    FOR SELECT USING (true);

-- Políticas para perfis_permissões
DROP POLICY IF EXISTS "Usuários podem ver suas permissões" ON public.perfis_permissoes;
CREATE POLICY "Usuários podem ver suas permissões" ON public.perfis_permissoes
    FOR SELECT USING (perfil_id = auth.uid());

-- 14. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_perfis_tenant_id ON public.perfis(tenant_id);
CREATE INDEX IF NOT EXISTS idx_perfis_email ON public.perfis(email);
CREATE INDEX IF NOT EXISTS idx_tenants_modulos_tenant_id ON public.tenants_modulos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_modulos_modulo_id ON public.tenants_modulos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tenant_id ON public.notificacoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON public.audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- 15. Comentários nas tabelas
COMMENT ON TABLE public.tenants IS 'Tabela de empresas/organizações do sistema';
COMMENT ON TABLE public.perfis IS 'Perfis de usuários vinculados às empresas';
COMMENT ON TABLE public.modulos IS 'Módulos disponíveis no sistema';
COMMENT ON TABLE public.tenants_modulos IS 'Módulos instalados por empresa';
COMMENT ON TABLE public.permissoes IS 'Permissões disponíveis no sistema';
COMMENT ON TABLE public.perfis_permissoes IS 'Permissões concedidas aos usuários';
COMMENT ON TABLE public.notificacoes IS 'Sistema de notificações';
COMMENT ON TABLE public.audit_log IS 'Log de auditoria do sistema';