// Teste do sistema otimizado de tokens
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testTokenOptimization() {
  console.log('🎯 Testando otimização de tokens...\n');
  
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ API key não encontrada');
    return;
  }
  
  // Teste 1: Prompt antigo (longo)
  const oldPrompt = `
Você é o assistente de IA do Hub.App, uma plataforma de gestão empresarial brasileira.

CONTEXTO ATUAL:
- Usuário está no módulo home
- Hub.App oferece: CRM (clientes/leads), Agenda (compromissos), Multifins (financeiro)

SOBRE O HUB.APP:
- Plataforma para micro e pequenas empresas
- Módulos integrados: vendas, financeiro, atendimento
- Interface mobile-first, otimizada para empreendedores

INSTRUÇÕES:
1. Responda SEMPRE em português brasileiro natural
2. Seja direto, prático e amigável
3. Use gírias brasileiras moderadas quando apropriado
4. Se puder executar uma ação, termine com "AÇÃO_SUGERIDA: [tipo]-[descrição]"

AÇÕES QUE POSSO EXECUTAR:
- AÇÃO_SUGERIDA: create-cliente - Criar novo cliente no CRM
- AÇÃO_SUGERIDA: create-receita - Lançar receita no financeiro  
- AÇÃO_SUGERIDA: create-agendamento - Criar compromisso na agenda
- AÇÃO_SUGERIDA: query-relatorio - Gerar relatórios e dados
- AÇÃO_SUGERIDA: query-clientes - Buscar informações de clientes
- AÇÃO_SUGERIDA: navigation-modulo - Navegar para módulo específico

MENSAGEM DO USUÁRIO:
"ola"

CONTEXTO ADICIONAL:
- Tela inicial do Hub.App

Responda como um assistente brasileiro experiente em gestão empresarial.
`;

  // Teste 2: Prompt novo (ultra compacto)
  const newPrompt = `Hub.App AI (português): Principal

Usuário: "ola"

Responda em 1-2 frases. Se puder ajudar com ação, termine com "AÇÃO_SUGERIDA: [create-cliente|create-receita|create-agendamento|query-relatorio]"`;

  console.log('📊 Comparação de prompts:');
  console.log(`📏 Prompt antigo: ${oldPrompt.length} caracteres`);
  console.log(`📏 Prompt novo: ${newPrompt.length} caracteres`);
  console.log(`💰 Redução: ${((oldPrompt.length - newPrompt.length) / oldPrompt.length * 100).toFixed(1)}%\n`);

  // Teste com prompt otimizado
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    console.log('🧪 Testando prompt otimizado...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: newPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100, // Muito menor!
          topP: 0.9,
          topK: 20
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
      
      console.log('✅ Resultado otimizado:');
      console.log('📝 Resposta:', responseText.trim());
      console.log('🎯 Tokens usados:', tokensUsed);
      console.log('💡 Meta: <50 tokens por resposta simples');
      
      if (tokensUsed < 50) {
        console.log('🎉 EXCELENTE! Uso de tokens otimizado!');
      } else if (tokensUsed < 100) {
        console.log('👍 BOM! Redução significativa de tokens');
      } else {
        console.log('⚠️  Ainda pode ser otimizado mais');
      }
      
    } else {
      const error = await response.text();
      console.error('❌ Erro:', response.status, error);
    }

  } catch (error) {
    console.error('💥 Erro:', error.message);
  }
}

testTokenOptimization().then(() => {
  console.log('\n✅ Teste de otimização finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});