// Script to install AI Agent module using existing Supabase configuration
// Run: node install-ai-agent.js

import { createClient } from '@supabase/supabase-js';

// Using the same configuration from src/utils/supabase/info.tsx
const projectId = "hnkcgtkrngldrtnsmzps";
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhua2NndGtybmdsZHJ0bnNtenBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQwMjUsImV4cCI6MjA3MjU5MDAyNX0.H0WzbCBuwx8luDIp4mHxzNFjxP1j2nzDj1pwMSzQbEQ";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function installAIAgent() {
  console.log('🤖 Installing AI Agent module...');
  
  try {
    // First, check if tipo column exists and add it if needed
    const { data: columns, error: columnError } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'modulos', 
        column_name: 'tipo' 
      });

    if (columnError) {
      console.log('⚠️  Note: Could not check tipo column, it may already exist');
    }

    // Insert AI Agent module
    const { data, error } = await supabase
      .from('modulos')
      .upsert({
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
      }, {
        onConflict: 'slug'
      });

    if (error) {
      throw error;
    }

    console.log('✅ AI Agent module installed successfully!');
    
    // Verify installation
    const { data: verification, error: verifyError } = await supabase
      .from('modulos')
      .select('nome, slug, tipo, categoria, preco_mensal, status')
      .eq('slug', 'ai-agent')
      .single();

    if (verifyError) {
      throw verifyError;
    }

    console.log('📊 Module verification:', verification);
    console.log('');
    console.log('🎉 AI Agent is now available in the App Store!');
    console.log('💡 Reload your Hub.App to see it in the Produtividade category');
    
  } catch (error) {
    console.error('❌ Error installing AI Agent:', error.message);
    console.log('');
    console.log('📋 Manual installation:');
    console.log('Copy and paste this SQL in Supabase Dashboard > SQL Editor:');
    console.log('');
    console.log(`
-- Add tipo column if it doesn't exist
ALTER TABLE modulos ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'page';

-- Insert AI Agent
INSERT INTO modulos (nome, slug, descricao, descricao_longa, link_destino, is_free, preco_mensal, categoria, status, desenvolvedor, tipo, manifest, avaliacao_media) 
VALUES (
  'AI Agent - Assistente IA', 
  'ai-agent', 
  'Chat inteligente que automatiza tarefas do seu negócio',
  'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App.',
  null, false, 19.90, 'produtividade', 'active', 'Hub.App Team', 'overlay',
  '{"icon": "Bot", "icone_lucide": "Bot", "version": "1.0.0", "overlay": true, "global": true}',
  4.9
) ON CONFLICT (slug) DO UPDATE SET tipo = EXCLUDED.tipo, manifest = EXCLUDED.manifest;
    `);
  }
}

// Run the installation
installAIAgent();