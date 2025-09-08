import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function GoogleAuthDebug() {
  const [showDebug, setShowDebug] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const { loginWithGoogle, error, isLoading } = useAuth();

  // Só mostrar em development
  if (import.meta.env.PROD) {
    return null;
  }

  const testGoogleAuth = async () => {
    setTestResult('Testando Google OAuth...');
    
    try {
      await loginWithGoogle();
      setTestResult('Redirecionamento para Google iniciado com sucesso!');
    } catch (error) {
      console.error('Erro no teste Google OAuth:', error);
      setTestResult(`Erro: ${error}`);
    }
  };

  const checkGoogleOAuthConfig = () => {
    console.log('🔧 Verificando configuração Google OAuth...');
    
    const issues = [];
    
    // Verificar se estamos em localhost ou HTTPS
    if (location.protocol === 'http:' && location.hostname !== 'localhost') {
      issues.push('Google OAuth requer HTTPS em produção');
    }
    
    // Verificar se o Supabase está configurado
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      issues.push('Variáveis de ambiente Supabase não configuradas');
    }
    
    console.log('📋 Status da configuração:');
    console.log('- URL atual:', window.location.href);
    console.log('- Protocolo:', location.protocol);
    console.log('- Supabase URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
    console.log('- Supabase Key:', supabaseKey ? '✅ Configurado' : '❌ Não configurado');
    
    if (issues.length === 0) {
      setTestResult('✅ Configuração básica OK. Verifique o Supabase Dashboard para ativar Google OAuth.');
    } else {
      setTestResult(`⚠️ Problemas encontrados: ${issues.join(', ')}`);
    }
  };

  const getSetupInstructions = () => {
    return `
🔧 Instruções para ativar Google OAuth:

1. Acesse Supabase Dashboard
2. Vá em Authentication > Providers  
3. Ative o Google provider
4. Configure Client ID e Secret do Google Cloud
5. URLs corretas:
   - Redirect: ${window.location.origin}/auth/callback
   - Origin: ${window.location.origin}

Veja GOOGLE_OAUTH_SETUP.md para detalhes completos!
    `;
  };

  if (!showDebug) {
    return (
      <motion.button
        onClick={() => setShowDebug(true)}
        className="fixed top-20 left-4 z-50 bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Google OAuth Debug"
      >
        Google Test
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed top-4 left-80 z-50 bg-white rounded-lg shadow-xl border p-4 w-80 max-h-96 overflow-y-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg">Google OAuth</h3>
        </div>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Status atual */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">Status</span>
          </div>
          <p className="text-xs text-gray-600">
            Botão implementado ✅<br/>
            Hook configurado ✅<br/>
            Precisa: Ativar no Supabase ⏳
          </p>
        </div>

        {/* Botões de teste */}
        <div className="space-y-2">
          <button
            onClick={testGoogleAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Testando...' : 'Testar Google Login'}
          </button>

          <button
            onClick={checkGoogleOAuthConfig}
            className="w-full bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
          >
            Verificar Configuração
          </button>

          <button
            onClick={() => {
              console.log(getSetupInstructions());
              setTestResult('📋 Instruções mostradas no console');
            }}
            className="w-full bg-orange-600 text-white py-2 px-3 rounded text-sm hover:bg-orange-700 transition-colors"
          >
            Mostrar Instruções
          </button>
        </div>

        {/* Resultado do teste */}
        {testResult && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {testResult.includes('✅') ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : testResult.includes('⚠️') || testResult.includes('Erro') ? (
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              ) : (
                <User className="w-4 h-4 text-blue-600" />
              )}
              <span className="font-medium text-sm">Resultado</span>
            </div>
            <p className="text-xs text-gray-700 whitespace-pre-line">{testResult}</p>
          </div>
        )}

        {/* Erro atual */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-sm text-red-800">Erro</span>
            </div>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* URLs atuais */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-sm mb-1">URLs para configuração:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              <strong>Origin:</strong> {window.location.origin}
            </div>
            <div>
              <strong>Callback:</strong> {window.location.origin}/auth/callback
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}