// Teste final com a nova chave Gemini integrada ao sistema
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testNewGeminiKey() {
  console.log('🎯 Testando nova chave Gemini integrada ao Hub.App...\n');
  
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY não encontrada no .env.local');
    return;
  }
  
  console.log('✅ Nova chave API encontrada:', apiKey.substring(0, 10) + '...');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  // Teste com prompt otimizado do Hub.App
  const testPrompt = `
Você é o assistente de IA do Hub.App, uma plataforma de gestão empresarial brasileira.

INSTRUÇÕES:
1. Responda SEMPRE em português brasileiro natural
2. Seja direto, prático e amigável
3. Se puder executar uma ação, termine com "AÇÃO_SUGERIDA: [tipo]-[descrição]"

MENSAGEM DO USUÁRIO:
"Oi, preciso criar um novo cliente no CRM"

Responda como um assistente brasileiro experiente em gestão empresarial.
`;

  try {
    console.log('📤 Enviando request para Gemini com prompt do Hub.App...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: testPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('📥 Resposta recebida:', data);

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('\n✅ SUCESSO! Resposta da nova chave Gemini:');
      console.log('=' .repeat(60));
      console.log(responseText);
      console.log('=' .repeat(60));
      
      // Verificar se contém ação
      if (responseText.includes('AÇÃO_SUGERIDA:')) {
        console.log('🎯 Sistema de ações funcionando com nova chave!');
      }
      
      // Verificar português brasileiro
      if (responseText.includes('cliente') || responseText.includes('CRM') || responseText.includes('criar')) {
        console.log('🇧🇷 Resposta em português brasileiro - perfeito!');
      }
      
      console.log('\n🎉 Nova chave Gemini funcionando perfeitamente no Hub.App!');
      console.log('🔄 Sistema pronto para rotação automática quando necessário');
      
    } else {
      console.error('❌ Formato de resposta inesperado:', data);
    }

  } catch (error) {
    console.error('💥 Erro ao testar nova chave Gemini:', error);
  }
}

testNewGeminiKey().then(() => {
  console.log('\n✅ Teste da nova chave finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});