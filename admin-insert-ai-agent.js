// Admin insert AI Agent using Service Role Key from .env.local
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables from .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/['"]/g, '');
  }
});

const supabaseUrl = 'https://hnkcgtkrngldrtnsmzps.supabase.co';
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

console.log('🔑 Using Service Role Key from .env.local');
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function insertAIAgentWithAdminAccess() {
  console.log('🤖 Inserting AI Agent with admin privileges...');
  
  const moduleData = {
    nome: 'AI Agent - Assistente IA',
    slug: 'ai-agent',
    descricao: 'Chat inteligente que automatiza tarefas do seu negócio',
    descricao_longa: 'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App. Processe extratos bancários, crie receitas, agende clientes e muito mais usando linguagem natural. Funciona como overlay global em todos os módulos.',
    link_destino: '', // Overlay modules don't need a specific URL
    is_free: false,
    preco_mensal: 19.90,
    categoria: 'produtividade',
    status: 'active',
    desenvolvedor: 'Hub.App Team',
    manifest: {
      icon: 'Bot',
      icone_lucide: 'Bot',
      version: '1.0.0',
      overlay: true,
      global: true,
      context_aware: true,
      supported_modules: ['*'],
      features: [
        'Chat em português brasileiro',
        'Processamento de PDFs de extrato',
        'Ações automáticas cross-module',
        'Comandos em linguagem natural',
        'Relatórios e insights automáticos',
        'Contexto automático por módulo'
      ]
    },
    avaliacao_media: 4.9
  };

  try {
    // Insert with admin privileges (bypasses RLS)
    const { data, error } = await supabase
      .from('modulos')
      .upsert(moduleData, {
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      throw error;
    }

    console.log('✅ AI Agent module inserted successfully with admin access!');
    console.log('📊 Inserted data:', data);

    // Verify insertion
    const { data: verification, error: verifyError } = await supabase
      .from('modulos')
      .select('nome, slug, categoria, is_free, preco_mensal, manifest')
      .eq('slug', 'ai-agent')
      .single();

    if (verifyError) {
      console.warn('⚠️  Verification failed:', verifyError.message);
    } else {
      console.log('🔍 Verification successful:');
      console.log(`   Name: ${verification.nome}`);
      console.log(`   Category: ${verification.categoria}`);
      console.log(`   Price: €${verification.preco_mensal}/month`);
      console.log(`   Overlay: ${verification.manifest?.overlay ? '✅' : '❌'}`);
      console.log(`   Global: ${verification.manifest?.global ? '✅' : '❌'}`);
    }

    // Check all modules to see if it's there
    const { data: allModules } = await supabase
      .from('modulos')
      .select('nome, slug, categoria')
      .eq('status', 'active')
      .order('categoria');

    console.log('📋 All active modules:');
    allModules?.forEach(mod => {
      const marker = mod.slug === 'ai-agent' ? '🤖' : '📦';
      console.log(`   ${marker} ${mod.nome} (${mod.categoria})`);
    });

    console.log('');
    console.log('🎉 SUCCESS! AI Agent is now in the App Store!');
    console.log('💡 Next steps:');
    console.log('   1. Reload your Hub.App');
    console.log('   2. Go to App Store → Produtividade');
    console.log('   3. Install AI Agent');
    console.log('   4. The floating chat button will appear globally! 🚀');

  } catch (error) {
    console.error('❌ Error inserting AI Agent:', error.message);
    console.error('Full error:', error);
  }
}

// Execute the insertion
insertAIAgentWithAdminAccess();