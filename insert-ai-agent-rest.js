// Insert AI Agent module via Supabase REST API
// Run: node insert-ai-agent-rest.js

const projectId = "hnkcgtkrngldrtnsmzps";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhua2NndGtybmdsZHJ0bnNtenBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQwMjUsImV4cCI6MjA3MjU5MDAyNX0.H0WzbCBuwx8luDIp4mHxzNFjxP1j2nzDj1pwMSzQbEQ";

const supabaseUrl = `https://${projectId}.supabase.co`;

async function insertAIAgentModule() {
  console.log('🤖 Inserting AI Agent module via REST API...');
  
  const moduleData = {
    nome: 'AI Agent - Assistente IA',
    slug: 'ai-agent', 
    descricao: 'Chat inteligente que automatiza tarefas do seu negócio',
    descricao_longa: 'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App. Processe extratos bancários, crie receitas, agende clientes e muito mais usando linguagem natural. Funciona como overlay global em todos os módulos.',
    link_destino: null,
    is_free: false,
    preco_mensal: 19.90,
    categoria: 'produtividade', 
    status: 'active',
    desenvolvedor: 'Hub.App Team',
    tipo: 'overlay',
    manifest: {
      icon: 'Bot',
      icone_lucide: 'Bot', 
      version: '1.0.0',
      overlay: true,
      global: true,
      features: [
        'Chat em português brasileiro',
        'Processamento de PDFs de extrato',
        'Ações automáticas cross-module',
        'Comandos em linguagem natural', 
        'Relatórios e insights automáticos',
        'Contexto automático por módulo'
      ],
      supported_modules: ['*']
    },
    avaliacao_media: 4.9
  };

  try {
    // First, check existing modules
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/modulos?slug=eq.ai-agent`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });

    const existing = await checkResponse.json();
    console.log('📋 Existing AI Agent modules:', existing.length);

    // Insert or update the module
    const method = existing.length > 0 ? 'PATCH' : 'POST';
    const url = existing.length > 0 
      ? `${supabaseUrl}/rest/v1/modulos?slug=eq.ai-agent`
      : `${supabaseUrl}/rest/v1/modulos`;

    const response = await fetch(url, {
      method: method,
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(moduleData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ AI Agent module inserted successfully!');
      console.log('📊 Module data:', result);
      
      // Verify insertion
      const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/modulos?slug=eq.ai-agent`, {
        method: 'GET', 
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const verification = await verifyResponse.json();
      console.log('🔍 Verification:', verification);
      console.log('');
      console.log('🎉 AI Agent is now available in the App Store!');
      console.log('💡 Reload your Hub.App to see it in the Produtividade category');
      
    } else {
      const error = await response.text();
      throw new Error(`API Error ${response.status}: ${error}`);
    }
    
  } catch (error) {
    console.error('❌ Error inserting AI Agent module:', error.message);
    
    console.log('');
    console.log('📋 Manual SQL fallback:');
    console.log(`
-- Execute this in Supabase Dashboard > SQL Editor:

ALTER TABLE modulos ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'page';

INSERT INTO modulos (
  nome, slug, descricao, descricao_longa, 
  is_free, preco_mensal, categoria, status, 
  desenvolvedor, tipo, manifest, avaliacao_media
) VALUES (
  'AI Agent - Assistente IA',
  'ai-agent', 
  'Chat inteligente que automatiza tarefas do seu negócio',
  'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App.',
  false, 19.90, 'produtividade', 'active',
  'Hub.App Team', 'overlay',
  '{"icon": "Bot", "icone_lucide": "Bot", "version": "1.0.0", "overlay": true, "global": true}',
  4.9
) ON CONFLICT (slug) DO UPDATE SET 
  tipo = EXCLUDED.tipo, 
  manifest = EXCLUDED.manifest;
    `);
  }
}

// Run the insertion
insertAIAgentModule();