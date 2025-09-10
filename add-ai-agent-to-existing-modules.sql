-- Add AI Agent to existing modules database
-- Execute this in Supabase Dashboard SQL Editor

-- First, check if we need to add 'tipo' column to existing modulos table
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

-- Add AI Agent module following the same format as existing modules
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
  'Assistente de IA que entende português brasileiro e executa ações em todos os módulos do Hub.App. Processe extratos bancários, crie receitas, agende clientes e muito mais usando linguagem natural. Funciona como overlay global em todos os módulos.',
  null, -- Overlay modules don't have specific URL destination
  false, -- Paid module
  19.90, -- Monthly price
  'produtividade', -- Same category as existing modules
  'active', 
  'Hub.App Team',
  'overlay', -- New type: overlay instead of page
  '{"icon": "Bot", "icone_lucide": "Bot", "version": "1.0.0", "overlay": true, "global": true}',
  4.9
) 
ON CONFLICT (slug) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  descricao_longa = EXCLUDED.descricao_longa,
  tipo = EXCLUDED.tipo,
  manifest = EXCLUDED.manifest;

-- Verify the AI Agent module was added
SELECT 
  nome, 
  slug, 
  tipo,
  categoria,
  preco_mensal,
  status,
  manifest->>'icon' as icon
FROM modulos 
WHERE slug = 'ai-agent';

-- Show all modules to verify
SELECT 
  nome, 
  slug, 
  COALESCE(tipo, 'page') as tipo,
  categoria,
  CASE 
    WHEN is_free THEN 'Grátis' 
    ELSE CONCAT('€', preco_mensal, '/mês')
  END as preco,
  manifest->>'icon' as icon
FROM modulos 
WHERE status = 'active'
ORDER BY is_free DESC, preco_mensal ASC;