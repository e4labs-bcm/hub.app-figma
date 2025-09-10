// Debug script para verificar conexão no browser
// Execute este script no console do browser para testar manualmente

console.log('🔍 DEBUG: Testando conexão do AI Agent...');

// Verificar se as variáveis de ambiente estão disponíveis
console.log('Variáveis de ambiente:');
console.log('VITE_GEMINI_API_KEY:', import.meta?.env?.VITE_GEMINI_API_KEY ? '***disponível***' : 'não encontrada');
console.log('VITE_GEMINI_API_KEY_1:', import.meta?.env?.VITE_GEMINI_API_KEY_1 ? '***disponível***' : 'não encontrada');
console.log('VITE_GEMINI_API_KEY_2:', import.meta?.env?.VITE_GEMINI_API_KEY_2 ? '***disponível***' : 'não encontrada');

// Teste manual da API Gemini
async function testGeminiConnection() {
  const apiKey = import.meta?.env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ API Key não encontrada');
    return;
  }
  
  console.log('🧪 Testando conexão direta com Gemini...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Diga apenas "Funcionando"' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('✅ Conexão funcionando! Resposta:', text.trim());
    } else {
      console.error('❌ Erro na API:', response.status, await response.text());
    }
  } catch (error) {
    console.error('💥 Erro de rede:', error);
  }
}

// Executar teste
testGeminiConnection();

// Instruções para o usuário
console.log(`
📋 INSTRUÇÕES:
1. Cole este código no console do navegador (F12)
2. Pressione Enter para executar
3. Verifique os resultados
4. Se funcionar, o problema está na aplicação React
5. Se não funcionar, o problema está na configuração da API
`);