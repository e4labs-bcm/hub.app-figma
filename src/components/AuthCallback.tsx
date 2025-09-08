import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Processar o callback do OAuth
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro no callback de autenticação:', error);
          window.location.href = '/';
          return;
        }

        if (data?.session) {
          console.log('Login com Google bem-sucedido:', data.session.user.email);
          // Redirecionar para a página principal
          window.location.href = '/';
        } else {
          console.log('Nenhuma sessão encontrada, redirecionando para home');
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Erro no callback:', error);
        window.location.href = '/';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Finalizando login com Google...</p>
      </div>
    </div>
  );
}