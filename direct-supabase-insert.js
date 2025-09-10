// Direct Supabase insertion using existing project config
import { createClient } from '@supabase/supabase-js';

// Using the same configuration from the project
const supabaseUrl = 'https://hnkcgtkrngldrtnsmzps.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhua2NndGtybmdsZHJ0bnNtenBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQwMjUsImV4cCI6MjA3MjU5MDAyNX0.H0WzbCBuwx8luDIp4mHxzNFjxP1j2nzDj1pwMSzQbEQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertAIAgent() {
  console.log('🤖 Inserting AI Agent module into Supabase...');
  
  const moduleData = {
    nome: 'AI Agent - Assistente IA',
    slug: 'ai-agent',
    descricao: 'Chat inteligente que automatiza tarefas do seu negócio',
    descricao_longa: 'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App. Processe extratos bancários, crie receitas, agende clientes e muito mais usando linguagem natural. Funciona como overlay global em todos os módulos.',
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
    // Try to insert the module
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

    console.log('✅ AI Agent module inserted successfully!');
    console.log('📊 Result:', data);

    // Verify the insertion
    const { data: verification, error: verifyError } = await supabase
      .from('modulos')
      .select('nome, slug, categoria, manifest, preco_mensal')
      .eq('slug', 'ai-agent')
      .single();

    if (verifyError) {
      console.warn('⚠️  Could not verify insertion:', verifyError.message);
    } else {
      console.log('🔍 Verification successful:', verification);
    }

    console.log('');
    console.log('🎉 AI Agent is now available in the App Store!');
    console.log('💡 Go to App Store > Produtividade category to install it');
    console.log('🤖 After installation, the floating chat button will appear globally');

  } catch (error) {
    console.error('❌ Error inserting AI Agent:', error.message);
    console.log('');
    console.log('🔍 Error details:', error);
  }
}

// Execute the insertion
insertAIAgent();