-- Sample modules for testing the App Store functionality
-- Execute this after the main schema

-- Clear existing modules (optional)
-- DELETE FROM tenants_modulos;
-- DELETE FROM modulos;

-- Insert sample modules with proper manifest data including icons
INSERT INTO modulos (nome, slug, descricao, descricao_longa, link_destino, is_free, preco_mensal, categoria, status, desenvolvedor, manifest, avaliacao_media) VALUES

-- Free modules (will be auto-installed for new tenants)
('CRM Básico', 'crm-basico', 'Gestão básica de contatos e leads', 
 'Sistema completo para gerenciar seus contatos, leads e oportunidades de venda. Inclui pipeline visual, histórico de interações e relatórios básicos.',
 'https://crm.hubapp.com.br', true, null, 'produtividade', 'active', 'Hub.App Team', 
 '{"icon": "Users", "icone_lucide": "Users", "version": "1.0.0"}', 4.8),

('Agenda', 'agenda', 'Calendário e agendamentos', 
 'Organize seus compromissos, agende reuniões e sincronize com Google Calendar. Perfeito para profissionais e equipes.',
 'https://agenda.hubapp.com.br', true, null, 'produtividade', 'active', 'Hub.App Team',
 '{"icon": "Calendar", "icone_lucide": "Calendar", "version": "1.0.0"}', 4.6),

-- Paid modules available for installation
('Financeiro Pro', 'financeiro-pro', 'Gestão financeira completa', 
 'Controle total das finanças da sua empresa: fluxo de caixa, contas a pagar/receber, relatórios gerenciais e muito mais.',
 'https://financeiro.hubapp.com.br', false, 29.90, 'financeiro', 'active', 'Hub.App Team',
 '{"icon": "DollarSign", "icone_lucide": "DollarSign", "version": "2.1.0"}', 4.9),

('E-commerce', 'ecommerce', 'Loja online integrada', 
 'Crie sua loja online completa com catálogo de produtos, carrinho de compras, pagamentos online e gestão de pedidos.',
 'https://loja.hubapp.com.br', false, 49.90, 'vendas', 'active', 'Hub.App Team',
 '{"icon": "ShoppingCart", "icone_lucide": "ShoppingCart", "version": "1.5.0"}', 4.7),

('Recursos Humanos', 'recursos-humanos', 'Gestão completa de RH', 
 'Controle de funcionários, folha de pagamento, ponto eletrônico, férias, benefícios e muito mais.',
 'https://rh.hubapp.com.br', false, 39.90, 'recursos_humanos', 'active', 'Hub.App Team',
 '{"icon": "UserCheck", "icone_lucide": "UserCheck", "version": "1.3.0"}', 4.5),

('Estoque Inteligente', 'estoque-inteligente', 'Controle de estoque avançado', 
 'Gerencie seu estoque com códigos de barras, alertas de baixo estoque, relatórios de giro e análises de demanda.',
 'https://estoque.hubapp.com.br', false, 24.90, 'produtividade', 'active', 'Hub.App Team',
 '{"icon": "Package", "icone_lucide": "Package", "version": "1.2.0"}', 4.8),

('Marketing Digital', 'marketing-digital', 'Automação de marketing', 
 'Email marketing, automação de campanhas, landing pages e análise de resultados. Tudo integrado.',
 'https://marketing.hubapp.com.br', false, 34.90, 'marketing', 'active', 'Hub.App Team',
 '{"icon": "Megaphone", "icone_lucide": "Megaphone", "version": "1.4.0"}', 4.6),

('Suporte ao Cliente', 'suporte-cliente', 'Central de atendimento', 
 'Sistema completo de tickets, chat online, base de conhecimento e relatórios de satisfação.',
 'https://suporte.hubapp.com.br', false, 19.90, 'comunicacao', 'active', 'Hub.App Team',
 '{"icon": "MessageCircle", "icone_lucide": "MessageCircle", "version": "1.1.0"}', 4.4),

-- Coming soon modules
('BI & Analytics', 'bi-analytics', 'Inteligência de negócios', 
 'Dashboards avançados, relatórios personalizados e análises preditivas para tomada de decisão estratégica.',
 'https://bi.hubapp.com.br', false, 79.90, 'produtividade', 'coming_soon', 'Hub.App Team',
 '{"icon": "BarChart3", "icone_lucide": "BarChart3", "version": "0.9.0"}', null),

('Delivery', 'delivery', 'Gestão de entregas', 
 'Sistema completo para delivery com rastreamento em tempo real, gestão de entregadores e otimização de rotas.',
 'https://delivery.hubapp.com.br', false, 29.90, 'vendas', 'beta', 'Hub.App Team',
 '{"icon": "Truck", "icone_lucide": "Truck", "version": "0.5.0"}', 4.2);

-- Create basic permissions for the free modules
INSERT INTO permissoes (modulo_id, codigo, nome, descricao, categoria) 
SELECT 
  m.id,
  LOWER(m.nome) || '.read',
  'Visualizar ' || m.nome,
  'Permite visualizar o módulo ' || m.nome,
  'basic'
FROM modulos m 
WHERE m.is_free = true AND m.status = 'active';

INSERT INTO permissoes (modulo_id, codigo, nome, descricao, categoria) 
SELECT 
  m.id,
  LOWER(m.nome) || '.write',
  'Editar ' || m.nome,  
  'Permite editar dados no módulo ' || m.nome,
  'basic'
FROM modulos m 
WHERE m.is_free = true AND m.status = 'active';

-- Install free modules for existing tenants
INSERT INTO tenants_modulos (tenant_id, modulo_id, status, data_instalacao)
SELECT 
  t.id as tenant_id,
  m.id as modulo_id,
  'active' as status,
  NOW() as data_instalacao
FROM tenants t
CROSS JOIN modulos m
WHERE m.is_free = true 
AND m.status = 'active'
ON CONFLICT (tenant_id, modulo_id) DO NOTHING;

COMMIT;