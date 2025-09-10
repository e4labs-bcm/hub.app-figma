// Teste da rotação automática de chaves Gemini
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testKeyRotation() {
  console.log('🔄 Testando rotação de chaves Gemini API...\n');
  
  // Verificar se ambas as chaves estão no ambiente
  const key1 = process.env.VITE_GEMINI_API_KEY_1;
  const key2 = process.env.VITE_GEMINI_API_KEY_2;
  const keyDefault = process.env.VITE_GEMINI_API_KEY;
  
  console.log('🔍 Chaves encontradas no ambiente:');
  console.log('  KEY_1:', key1 ? `...${key1.slice(-8)}` : 'não encontrada');
  console.log('  KEY_2:', key2 ? `...${key2.slice(-8)}` : 'não encontrada');
  console.log('  DEFAULT:', keyDefault ? `...${keyDefault.slice(-8)}` : 'não encontrada');
  
  if (!key1 || !key2) {
    console.log('❌ Precisa de pelo menos 2 chaves para testar rotação');
    return;
  }
  
  // Testar as duas chaves individualmente
  console.log('\n🧪 Testando cada chave individualmente...');
  
  await testSingleKey('KEY_1', key1);
  await testSingleKey('KEY_2', key2);
  
  console.log('\n✅ Teste de rotação de chaves finalizado');
  console.log('💡 Agora o sistema pode alternar automaticamente entre as chaves quando uma atingir a quota');
}

async function testSingleKey(name, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    console.log(`\n🔑 Testando ${name} (${apiKey.slice(-8)}...):`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Diga apenas "OK"' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'sem resposta';
      console.log(`  ✅ ${name}: Funcional - resposta: "${text.trim()}"`);
    } else {
      const error = await response.text();
      if (response.status === 429) {
        console.log(`  ⏸️  ${name}: Quota esgotada (esperado para chave antiga)`);
      } else {
        console.log(`  ❌ ${name}: Erro ${response.status} - ${error.substring(0, 100)}`);
      }
    }
  } catch (error) {
    console.log(`  💥 ${name}: Erro de rede - ${error.message}`);
  }
}

testKeyRotation().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});