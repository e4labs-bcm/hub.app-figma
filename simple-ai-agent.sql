-- Simple AI Agent installation
-- Execute in Supabase Dashboard > SQL Editor

-- Add tipo column (will be ignored if exists)
ALTER TABLE modulos ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'page';

-- Insert AI Agent module
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

-- Verify installation
SELECT nome, slug, tipo, categoria, preco_mensal 
FROM modulos 
WHERE slug = 'ai-agent';