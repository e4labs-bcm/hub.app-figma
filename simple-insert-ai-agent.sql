-- Insert AI Agent module (without tipo column)
-- Execute in Supabase Dashboard > SQL Editor

INSERT INTO modulos (
  nome, slug, descricao, descricao_longa, 
  is_free, preco_mensal, categoria, status, 
  desenvolvedor, manifest, avaliacao_media
) VALUES (
  'AI Agent - Assistente IA',
  'ai-agent', 
  'Chat inteligente que automatiza tarefas do seu negócio',
  'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App. Processe extratos bancários, crie receitas, agende clientes e muito mais usando linguagem natural. Funciona como overlay global em todos os módulos.',
  false, 19.90, 'produtividade', 'active',
  'Hub.App Team',
  '{"icon": "Bot", "icone_lucide": "Bot", "version": "1.0.0", "overlay": true, "global": true, "context_aware": true, "supported_modules": ["*"], "features": ["Chat em português brasileiro", "Processamento de PDFs", "Ações cross-module", "Contexto automático"]}',
  4.9
) ON CONFLICT (slug) DO UPDATE SET 
  manifest = EXCLUDED.manifest,
  descricao_longa = EXCLUDED.descricao_longa;

-- Verify installation
SELECT nome, slug, categoria, manifest->>'icon' as icon, manifest->'overlay' as is_overlay
FROM modulos 
WHERE slug = 'ai-agent';