-- Atualizar o módulo MultiFins com o link_destino correto
UPDATE modulos 
SET 
  link_destino = 'https://preview--multifins.lovable.app/',
  descricao = 'Sistema de gestão financeira completo com controle de receitas, despesas e relatórios',
  descricao_longa = 'O MultiFins Light é uma solução completa para gestão financeira empresarial, oferecendo controle detalhado de receitas e despesas, categorização inteligente de transações, relatórios financeiros em tempo real e dashboards interativos para acompanhamento da saúde financeira do seu negócio.'
WHERE nome = 'Financeiro MultiFins' OR nome LIKE '%MultiFins%' OR nome LIKE '%Financeiro%';

-- Verificar se a atualização foi feita
SELECT id, nome, link_destino, categoria, status 
FROM modulos 
WHERE nome LIKE '%MultiFins%' OR nome LIKE '%Financeiro%';