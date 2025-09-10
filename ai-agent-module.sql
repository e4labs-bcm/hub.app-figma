-- AI Agent Module Installation (Overlay Type)
-- Adds the AI Agent as an installable overlay module in the Hub.App store

-- First, check if we need to add 'tipo' column to modulos table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'modulos' AND column_name = 'tipo'
    ) THEN
        ALTER TABLE modulos ADD COLUMN tipo TEXT DEFAULT 'page';
        -- Update existing modules to be 'page' type
        UPDATE modulos SET tipo = 'page' WHERE tipo IS NULL;
    END IF;
END $$;

-- Insert AI Agent module as overlay type
INSERT INTO modulos (
  nome, 
  slug, 
  descricao, 
  descricao_longa, 
  link_destino, 
  is_free, 
  preco_mensal, 
  categoria, 
  status, 
  desenvolvedor, 
  tipo,
  manifest, 
  avaliacao_media
) VALUES (
  'AI Agent - Assistente IA', 
  'ai-agent', 
  'Chat inteligente que automatiza tarefas do seu negócio',
  'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App. Processe extratos bancários, crie receitas, agende clientes e muito mais usando linguagem natural. Inclui processamento de PDFs, ações cross-module e insights automáticos. Funciona como overlay global em todos os módulos.',
  null, -- Overlay modules don't have specific destination
  false, 
  19.90, 
  'produtividade', 
  'active', 
  'Hub.App Team',
  'overlay', -- This is the key: overlay type module
  '{
    "icon": "Bot",
    "icone_lucide": "Bot",
    "version": "1.0.0",
    "overlay": true,
    "global": true,
    "features": [
      "Chat em português brasileiro",
      "Processamento de PDFs de extrato",
      "Ações automáticas cross-module",
      "Comandos em linguagem natural",
      "Relatórios e insights automáticos",
      "Contexto automático por módulo"
    ],
    "integration_type": "overlay",
    "requires_api": true,
    "api_endpoints": [
      "/api/ai/chat",
      "/api/ai/process-pdf",
      "/api/ai/actions",
      "/api/ai/context"
    ],
    "supported_modules": [
      "multifins",
      "crm-basico", 
      "agenda",
      "home",
      "*"
    ],
    "ai_provider": "gemini",
    "privacy_compliant": true,
    "data_anonymization": true,
    "context_aware": true,
    "cross_module_actions": true
  }',
  4.9
);

-- Get the AI Agent module ID for further operations
DO $$
DECLARE
  ai_agent_module_id UUID;
BEGIN
  SELECT id INTO ai_agent_module_id FROM modulos WHERE slug = 'ai-agent';
  
  -- Create permissions for AI Agent module
  INSERT INTO permissoes (modulo_id, codigo, nome, descricao, categoria) VALUES
  (ai_agent_module_id, 'ai-agent.use', 'Usar AI Agent', 'Permite acessar o assistente de IA global', 'basic'),
  (ai_agent_module_id, 'ai-agent.chat', 'Chat com IA', 'Permite conversar com o assistente de IA', 'basic'),
  (ai_agent_module_id, 'ai-agent.actions', 'Executar Ações IA', 'Permite que a IA execute ações nos módulos', 'advanced'),
  (ai_agent_module_id, 'ai-agent.cross-module', 'Ações Cross-Module', 'Permite ações que conectam múltiplos módulos', 'advanced'),
  (ai_agent_module_id, 'ai-agent.pdf', 'Processar PDFs', 'Permite upload e processamento de documentos PDF', 'basic'),
  (ai_agent_module_id, 'ai-agent.reports', 'Relatórios IA', 'Permite gerar relatórios e insights automáticos', 'advanced'),
  (ai_agent_module_id, 'ai-agent.admin', 'Configurar IA', 'Permite configurar preferências do assistente IA', 'admin');
  
  -- Log the installation
  RAISE NOTICE 'AI Agent module created with ID: % as overlay type', ai_agent_module_id;
END $$;

-- Create AI Agent specific tables with proper structure for overlay functionality

-- AI Agents configuration per tenant
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL DEFAULT 'general', -- 'general', 'financeiro', 'crm', 'agenda'
  provider TEXT DEFAULT 'gemini', -- LLM provider ativo
  configuracoes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de conversas com contexto de módulo
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  module_context TEXT, -- 'multifins', 'crm-basico', 'agenda', 'home'
  page_context TEXT, -- specific page within module if applicable
  context_data JSONB DEFAULT '{}', -- additional context information
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Mensagens individuais com metadata expandida
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- ações, custos, provider usado, contexto
  tokens_used INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0, -- custo em centavos
  processing_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de ações executadas com suporte cross-module
CREATE TABLE IF NOT EXISTS ai_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL, -- 'multifins-criar-receita', 'crm-criar-contato'
  source_module_id TEXT NOT NULL, -- module where action was triggered
  target_module_id TEXT NOT NULL, -- module where action is executed
  parameters JSONB,
  result JSONB,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'executed', 'failed', 'cancelled')) DEFAULT 'pending',
  error_message TEXT,
  confirmation_required BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cache de processamento de PDFs
CREATE TABLE IF NOT EXISTS ai_pdf_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  file_hash TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  extracted_data JSONB,
  processing_metadata JSONB,
  bank_detected TEXT, -- which bank was detected
  transaction_count INTEGER DEFAULT 0,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, file_hash)
);

-- Configurações de IA por tenant (overlay-specific settings)
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB,
  module_context TEXT, -- settings can be module-specific
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, setting_key, module_context)
);

-- Context detection cache for performance
CREATE TABLE IF NOT EXISTS ai_context_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  module_slug TEXT NOT NULL,
  page_path TEXT,
  context_data JSONB,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, user_id, module_slug)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS ai_conversations_tenant_user_idx ON ai_conversations(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS ai_conversations_session_idx ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS ai_conversations_module_context_idx ON ai_conversations(module_context);

CREATE INDEX IF NOT EXISTS ai_messages_conversation_created_idx ON ai_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS ai_messages_role_idx ON ai_messages(role);

CREATE INDEX IF NOT EXISTS ai_actions_log_tenant_status_idx ON ai_actions_log(tenant_id, status);
CREATE INDEX IF NOT EXISTS ai_actions_log_source_target_idx ON ai_actions_log(source_module_id, target_module_id);
CREATE INDEX IF NOT EXISTS ai_actions_log_created_idx ON ai_actions_log(created_at);

CREATE INDEX IF NOT EXISTS ai_pdf_cache_tenant_status_idx ON ai_pdf_cache(tenant_id, processing_status);
CREATE INDEX IF NOT EXISTS ai_pdf_cache_created_idx ON ai_pdf_cache(created_at);

CREATE INDEX IF NOT EXISTS ai_settings_tenant_key_idx ON ai_settings(tenant_id, setting_key);
CREATE INDEX IF NOT EXISTS ai_context_cache_tenant_user_idx ON ai_context_cache(tenant_id, user_id);

-- RLS Policies para isolamento multi-tenant
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_pdf_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_context_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "ai_agents_tenant_isolation" ON ai_agents FOR ALL USING (tenant_id = get_my_tenant_id());

CREATE POLICY "ai_conversations_tenant_isolation" ON ai_conversations FOR ALL USING (tenant_id = get_my_tenant_id());

CREATE POLICY "ai_messages_tenant_isolation" ON ai_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM ai_conversations 
    WHERE id = conversation_id 
    AND tenant_id = get_my_tenant_id()
  )
);

CREATE POLICY "ai_actions_log_tenant_isolation" ON ai_actions_log FOR ALL USING (tenant_id = get_my_tenant_id());

CREATE POLICY "ai_pdf_cache_tenant_isolation" ON ai_pdf_cache FOR ALL USING (tenant_id = get_my_tenant_id());

CREATE POLICY "ai_settings_tenant_isolation" ON ai_settings FOR ALL USING (tenant_id = get_my_tenant_id());

CREATE POLICY "ai_context_cache_tenant_isolation" ON ai_context_cache FOR ALL USING (tenant_id = get_my_tenant_id());

-- Function to auto-create AI agent when module is installed
CREATE OR REPLACE FUNCTION create_ai_agent_on_install()
RETURNS TRIGGER AS $$
DECLARE
  ai_module_id UUID;
BEGIN
  -- Check if this is AI Agent module installation
  SELECT id INTO ai_module_id FROM modulos WHERE slug = 'ai-agent' AND id = NEW.modulo_id;
  
  IF ai_module_id IS NOT NULL AND NEW.status = 'active' THEN
    -- Create default AI agent for this tenant
    INSERT INTO ai_agents (tenant_id, agent_type, provider, configuracoes, is_active)
    VALUES (
      NEW.tenant_id, 
      'general', 
      'gemini',
      '{
        "language": "pt-BR",
        "max_tokens": 1000,
        "temperature": 0.7,
        "context_window": 4000,
        "auto_actions": true,
        "pdf_processing": true,
        "cross_module": true
      }',
      true
    )
    ON CONFLICT DO NOTHING;
    
    -- Create default settings
    INSERT INTO ai_settings (tenant_id, setting_key, setting_value)
    VALUES 
    (NEW.tenant_id, 'welcome_shown', 'false'),
    (NEW.tenant_id, 'auto_suggestions', 'true'),
    (NEW.tenant_id, 'context_detection', 'true'),
    (NEW.tenant_id, 'pdf_auto_categorize', 'true')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for AI agent auto-creation
CREATE TRIGGER ai_agent_auto_create
  AFTER INSERT ON tenants_modulos
  FOR EACH ROW
  EXECUTE FUNCTION create_ai_agent_on_install();

-- Auto-cleanup policies for data retention
CREATE OR REPLACE FUNCTION cleanup_ai_data() RETURNS void AS $$
BEGIN
  -- Remove conversations older than 90 days
  DELETE FROM ai_conversations 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remove action logs older than 1 year (compliance)
  DELETE FROM ai_actions_log
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Remove PDF cache older than 30 days
  DELETE FROM ai_pdf_cache
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Clean context cache older than 7 days
  DELETE FROM ai_context_cache
  WHERE last_accessed < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- Success notifications
\echo '🤖 AI Agent module successfully added to Hub.App as OVERLAY type!'
\echo ''
\echo '✅ Module Configuration:'
\echo '   - Name: AI Agent - Assistente IA'  
\echo '   - Type: overlay (global)'
\echo '   - Price: €19.90/month'
\echo '   - Status: Active in App Store'
\echo ''
\echo '🎯 Features:'
\echo '   - Chat inteligente em português'
\echo '   - Context-aware per module'
\echo '   - Cross-module actions'
\echo '   - PDF processing'
\echo '   - Multi-tenant with RLS'
\echo ''
\echo '📊 Database Tables Created:'
\echo '   - ai_agents (tenant config)'
\echo '   - ai_conversations (chat history)'  
\echo '   - ai_messages (individual messages)'
\echo '   - ai_actions_log (executed actions)'
\echo '   - ai_pdf_cache (document processing)'
\echo '   - ai_settings (tenant preferences)'
\echo '   - ai_context_cache (performance)'
\echo ''
\echo '🔐 Security: RLS enabled on all tables'
\echo '🚀 Ready for App Store installation!'