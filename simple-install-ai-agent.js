import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function installAIAgent() {
  console.log('🤖 Installing AI Agent in existing modulos table...');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // Insert AI Agent using existing table structure
    const { data, error } = await supabase
      .from('modulos')
      .upsert({
        nome: 'AI Agent',
        slug: 'ai-agent',
        descricao: 'Assistente de IA inteligente',
        descricao_longa: 'Assistente de IA que automatiza tarefas usando linguagem natural',
        link_destino: null,
        is_free: false,
        preco_mensal: 19.90,
        categoria: 'produtividade',
        status: 'active',
        desenvolvedor: 'Hub.App Team',
        icone_lucide: 'Bot',
        manifest: {
          "overlay": true,
          "global": true,
          "version": "1.0.0"
        },
        avaliacao_media: 4.9
      }, { 
        onConflict: 'slug'
      })
      .select();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ AI Agent installed successfully!');
    console.log('📊 Module data:', data);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

installAIAgent().then(() => {
  console.log('\n🎉 Installation complete! Refresh your app to see AI Agent.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});