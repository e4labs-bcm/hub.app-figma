// Teste simples da integração Gemini
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGeminiIntegration() {
  console.log('🧪 Testando integração Gemini...');
  
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY não encontrada no .env.local');
    return;
  }
  
  console.log('✅ API Key encontrada:', apiKey.substring(0, 10) + '...');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const testPrompt = `
Você é o assistente de IA do Hub.App, uma plataforma de gestão empresarial brasileira.

INSTRUÇÕES:
1. Responda SEMPRE em português brasileiro natural
2. Seja direto, prático e amigável
3. Se puder executar uma ação, termine com "AÇÃO_SUGERIDA: [tipo]-[descrição]"

MENSAGEM DO USUÁRIO:
"Olá, como você pode me ajudar?"

Responda como um assistente brasileiro experiente em gestão empresarial.
`;

  try {
    console.log('📤 Enviando request para Gemini...');
    
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
      console.log('\n✅ SUCESSO! Resposta do Gemini:');
      console.log('=' .repeat(50));
      console.log(responseText);
      console.log('=' .repeat(50));
      
      // Verificar se contém ação
      if (responseText.includes('AÇÃO_SUGERIDA:')) {
        console.log('🎯 Sistema de ações funcionando!');
      }
      
      console.log('\n🎉 Gemini integrado com sucesso ao Hub.App!');
    } else {
      console.error('❌ Formato de resposta inesperado:', data);
    }

  } catch (error) {
    console.error('💥 Erro ao testar Gemini:', error);
  }
}

testGeminiIntegration().then(() => {
  console.log('\n✅ Teste finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});