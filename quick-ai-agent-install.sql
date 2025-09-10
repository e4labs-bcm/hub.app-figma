-- Quick AI Agent Installation for App Store
-- Execute this in Supabase Dashboard SQL Editor

-- Add tipo column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'modulos' AND column_name = 'tipo'
    ) THEN
        ALTER TABLE modulos ADD COLUMN tipo TEXT DEFAULT 'page';
        UPDATE modulos SET tipo = 'page' WHERE tipo IS NULL;
    END IF;
END $$;

-- Insert AI Agent module
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
  null,
  false, 
  19.90, 
  'produtividade', 
  'active', 
  'Hub.App Team',
  'overlay',
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
    "supported_modules": ["*"]
  }',
  4.9
)
ON CONFLICT (slug) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  descricao_longa = EXCLUDED.descricao_longa,
  preco_mensal = EXCLUDED.preco_mensal,
  categoria = EXCLUDED.categoria,
  status = EXCLUDED.status,
  tipo = EXCLUDED.tipo,
  manifest = EXCLUDED.manifest,
  avaliacao_media = EXCLUDED.avaliacao_media;

-- Verify installation
SELECT nome, slug, tipo, status, preco_mensal 
FROM modulos 
WHERE slug = 'ai-agent';