import { supabase } from '../lib/supabase';

export async function checkMultiFinsModule() {
  try {
    console.log('🔍 Verificando módulo MultiFins atual...');

    const { data: modules, error } = await supabase
      .from('modulos')
      .select('*')
      .or('nome.ilike.%MultiFins%,nome.ilike.%Financeiro%');

    if (error) {
      console.error('❌ Erro ao buscar módulos:', error);
      return;
    }

    console.log('📦 Módulos encontrados:', modules);
    return modules;

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

export async function fixMultiFinsURL() {
  try {
    console.log('🔧 Corrigindo URL do MultiFins...');

    const { data, error } = await supabase
      .from('modulos')
      .update({
        link_destino: 'https://preview--multifins.lovable.app'  // Sem a barra final
      })
      .eq('nome', 'Financeiro MultiFins')
      .select();

    if (error) {
      console.error('❌ Erro ao corrigir URL:', error);
      return;
    }

    console.log('✅ URL corrigida:', data);
    return data;

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

export async function updateMultiFinsModule() {
  try {
    console.log('🔄 Atualizando módulo MultiFins...');

    // Primeiro, vamos buscar o módulo MultiFins
    const { data: modules, error: searchError } = await supabase
      .from('modulos')
      .select('*')
      .or('nome.ilike.%MultiFins%,nome.ilike.%Financeiro%');

    if (searchError) {
      console.error('❌ Erro ao buscar módulos:', searchError);
      return;
    }

    console.log('📦 Módulos encontrados:', modules);

    if (!modules || modules.length === 0) {
      console.log('⚠️ Nenhum módulo MultiFins encontrado');
      return;
    }

    // Atualizar o primeiro módulo encontrado (provavelmente o MultiFins)
    const moduleToUpdate = modules[0];
    console.log('🎯 Atualizando módulo:', moduleToUpdate.nome);

    const { data, error } = await supabase
      .from('modulos')
      .update({
        link_destino: 'https://preview--multifins.lovable.app/',
        descricao: 'Sistema de gestão financeira completo com controle de receitas, despesas e relatórios',
        descricao_longa: 'O MultiFins Light é uma solução completa para gestão financeira empresarial, oferecendo controle detalhado de receitas e despesas, categorização inteligente de transações, relatórios financeiros em tempo real e dashboards interativos para acompanhamento da saúde financeira do seu negócio.'
      })
      .eq('id', moduleToUpdate.id)
      .select();

    if (error) {
      console.error('❌ Erro ao atualizar módulo:', error);
      return;
    }

    console.log('✅ Módulo atualizado com sucesso:', data);
    return data;

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}