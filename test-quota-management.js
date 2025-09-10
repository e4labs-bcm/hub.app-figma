// Test do sistema de gerenciamento de quota
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import class diretamente (simular ambiente)
import { LLMRouter } from './Modulos/ai-agent/services/llm/LLMRouter.js';

async function testQuotaManagement() {
  console.log('🧪 Testando sistema de gerenciamento de quota...\n');
  
  const router = new LLMRouter();
  
  // Teste 1: Status dos providers
  console.log('📊 Status inicial dos providers:');
  const initialStatus = router.getProvidersStatus();
  console.log(JSON.stringify(initialStatus, null, 2));
  
  // Teste 2: Tentar processar mensagem (deve falhar por quota)
  console.log('\n🚀 Tentando processar mensagem simples...');
  try {
    const response = await router.processMessage({
      message: 'Olá, você pode me ajudar?',
      tenantId: 'test-tenant',
      userId: 'test-user',
      context: { module: 'home' }
    });
    
    console.log('✅ Resposta recebida:');
    console.log('Mensagem:', response.message.substring(0, 100) + '...');
    console.log('Provider:', response.metadata?.provider);
    console.log('Ações:', response.actions?.length || 0);
    
  } catch (error) {
    console.log('❌ Erro esperado (quota exhausted):', error.message);
  }
  
  // Teste 3: Status após tentativa
  console.log('\n📊 Status após tentativa:');
  const afterStatus = router.getProvidersStatus();
  console.log(JSON.stringify(afterStatus, null, 2));
  
  // Teste 4: Testar fallback response
  console.log('\n🔄 Testando resposta de fallback para CRM...');
  try {
    const fallbackResponse = await router.processMessage({
      message: 'preciso criar um cliente',
      tenantId: 'test-tenant',
      userId: 'test-user',
      context: { module: 'crm' }
    });
    
    console.log('✅ Fallback response:');
    console.log('Mensagem:', fallbackResponse.message);
    console.log('Ações:', fallbackResponse.actions?.map(a => a.title) || []);
    
  } catch (error) {
    console.log('❌ Erro no fallback:', error.message);
  }
  
  console.log('\n🎉 Teste de quota management finalizado');
  
  // Cleanup
  router.destroy();
  process.exit(0);
}

testQuotaManagement().catch(error => {
  console.error('💥 Erro fatal no teste:', error);
  process.exit(1);
});