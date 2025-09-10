// Insert AI Agent via RPC function to bypass RLS
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnkcgtkrngldrtnsmzps.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhua2NndGtybmdsZHJ0bnNtenBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQwMjUsImV4cCI6MjA3MjU5MDAyNX0.H0WzbCBuwx8luDIp4mHxzNFjxP1j2nzDj1pwMSzQbEQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertAIAgentViaRPC() {
  console.log('🤖 Inserting AI Agent via RPC function...');

  try {
    // Call RPC function to insert the module (bypassing RLS)
    const { data, error } = await supabase.rpc('insert_ai_agent_module', {
      module_nome: 'AI Agent - Assistente IA',
      module_slug: 'ai-agent',
      module_descricao: 'Chat inteligente que automatiza tarefas do seu negócio',
      module_descricao_longa: 'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App. Processe extratos bancários, crie receitas, agende clientes e muito mais usando linguagem natural.',
      module_is_free: false,
      module_preco_mensal: 19.90,
      module_categoria: 'produtividade',
      module_status: 'active',
      module_desenvolvedor: 'Hub.App Team',
      module_manifest: {
        icon: 'Bot',
        icone_lucide: 'Bot',
        version: '1.0.0',
        overlay: true,
        global: true,
        context_aware: true,
        supported_modules: ['*']
      },
      module_avaliacao_media: 4.9
    });

    if (error) {
      throw error;
    }

    console.log('✅ AI Agent module inserted via RPC!');
    console.log('📊 Result:', data);
    
    console.log('');
    console.log('🎉 AI Agent is now available in the App Store!');
    
  } catch (error) {
    console.error('❌ RPC Error:', error.message);
    
    // If RPC function doesn't exist, provide SQL to create it
    if (error.message.includes('function') && error.message.includes('does not exist')) {
      console.log('');
      console.log('📋 The RPC function needs to be created first.');
      console.log('Execute this SQL in Supabase Dashboard > SQL Editor:');
      console.log('');
      console.log(`
CREATE OR REPLACE FUNCTION insert_ai_agent_module(
  module_nome TEXT,
  module_slug TEXT,
  module_descricao TEXT,
  module_descricao_longa TEXT,
  module_is_free BOOLEAN,
  module_preco_mensal DECIMAL,
  module_categoria TEXT,
  module_status TEXT,
  module_desenvolvedor TEXT,
  module_manifest JSONB,
  module_avaliacao_media DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  INSERT INTO modulos (
    nome, slug, descricao, descricao_longa, 
    is_free, preco_mensal, categoria, status, 
    desenvolvedor, manifest, avaliacao_media
  ) VALUES (
    module_nome, module_slug, module_descricao, module_descricao_longa,
    module_is_free, module_preco_mensal, module_categoria, module_status,
    module_desenvolvedor, module_manifest, module_avaliacao_media
  ) ON CONFLICT (slug) DO UPDATE SET
    manifest = EXCLUDED.manifest,
    descricao_longa = EXCLUDED.descricao_longa;
  
  SELECT json_build_object('success', true, 'module', module_slug) INTO result;
  RETURN result;
END;
$$;

-- Then call the function:
SELECT insert_ai_agent_module(
  'AI Agent - Assistente IA',
  'ai-agent',
  'Chat inteligente que automatiza tarefas do seu negócio',
  'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App.',
  false,
  19.90,
  'produtividade',
  'active',
  'Hub.App Team',
  '{"icon": "Bot", "icone_lucide": "Bot", "version": "1.0.0", "overlay": true, "global": true, "context_aware": true, "supported_modules": ["*"]}'::jsonb,
  4.9
);
      `);
    } else {
      console.log('');
      console.log('📋 Alternative: Execute this simple SQL:');
      console.log(`
-- Direct SQL (if you have admin access)
INSERT INTO modulos (
  nome, slug, descricao, descricao_longa, 
  is_free, preco_mensal, categoria, status, 
  desenvolvedor, manifest, avaliacao_media
) VALUES (
  'AI Agent - Assistente IA', 'ai-agent', 
  'Chat inteligente que automatiza tarefas do seu negócio',
  'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App.',
  false, 19.90, 'produtividade', 'active', 'Hub.App Team',
  '{"icon": "Bot", "icone_lucide": "Bot", "version": "1.0.0", "overlay": true, "global": true, "context_aware": true, "supported_modules": ["*"]}',
  4.9
);
      `);
    }
  }
}

// Execute
insertAIAgentViaRPC();