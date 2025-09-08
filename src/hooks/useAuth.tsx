import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Perfil, Tenant } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthContextType {
  user: Perfil | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsCompany: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createCompany: (data: { nome: string; cnpj?: string; email?: string }) => Promise<void>;
  error: string | null;
  clearError: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState({
    user: null as Perfil | null,
    tenant: null as Tenant | null,
    isAuthenticated: false,
    isLoading: true,
    needsCompany: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Verificar se há usuário logado ao carregar
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Verificar sessão ativa no Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao verificar sessão:', sessionError);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Se não há sessão, usuário não está logado
      if (!session) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Processar autenticação se há sessão
      await handleAuthChange(session);

    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      setError('Erro ao carregar dados de autenticação');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAuthChange = async (session: any) => {
    try {
      if (!session) {
        // Logout
        setAuthState(prev => ({
          ...prev,
          user: null,
          tenant: null,
          isAuthenticated: false,
          needsCompany: false,
          isLoading: false
        }));
        return;
      }

      // Buscar perfil do usuário
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/profile/${session.user.id}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Usuário não tem perfil, precisa criar empresa
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            needsCompany: true,
            isLoading: false
          }));
          return;
        }
        throw new Error(`Erro ao buscar perfil: ${response.status}`);
      }

      const { profile } = await response.json();

      if (!profile || !profile.tenant_id) {
        // Usuário existe mas não tem empresa
        setAuthState(prev => ({
          ...prev,
          user: profile,
          isAuthenticated: true,
          needsCompany: true,
          isLoading: false
        }));
      } else {
        // Usuário completo com empresa
        setAuthState(prev => ({
          ...prev,
          user: profile,
          tenant: profile.tenants,
          isAuthenticated: true,
          needsCompany: false,
          isLoading: false
        }));
      }

    } catch (error) {
      console.error('Erro ao processar autenticação:', error);
      setError('Erro ao carregar dados do usuário');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loginWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });

      if (error) {
        throw new Error(error.message);
      }

      // O redirecionamento será automático
      // A autenticação será processada no callback
      
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setError('Erro ao fazer login com Google. Tente novamente.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loginWithPassword = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      // handleAuthChange será chamado automaticamente via listener
      
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Email ou senha incorretos');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signUpWithPassword = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      console.log('Iniciando signup com:', email);

      // Usar a rota do servidor para criar usuário com confirmação automática
      const signupResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.error || 'Erro ao criar conta');
      }

      const { user } = await signupResponse.json();
      console.log('Usuário criado via servidor:', user?.id);

      // Agora fazer login com as credenciais
      console.log('Fazendo login após criação...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro ao fazer login após signup:', error);
        throw new Error('Conta criada, mas erro ao fazer login. Tente fazer login normalmente.');
      }

      console.log('Login automático após signup bem-sucedido');
      // O listener cuidará do processamento da sessão
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const createCompany = async (data: { nome: string; cnpj?: string; email?: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Usuário não autenticado');
      }

      // Usar a função RPC do novo schema
      const { data: result, error: rpcError } = await supabase
        .rpc('create_new_tenant', {
          p_nome_empresa: data.nome,
          p_cnpj: data.cnpj,
          p_email_empresa: data.email
        });

      if (rpcError) {
        throw new Error(rpcError.message || 'Erro ao criar empresa');
      }

      if (!result || !result.success) {
        throw new Error(result?.message || 'Erro ao criar empresa');
      }

      // Recarregar dados do usuário
      await handleAuthChange(session);
      
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar empresa');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }

      setAuthState(prev => ({
        ...prev,
        user: null,
        tenant: null,
        isAuthenticated: false,
        needsCompany: false,
        isLoading: false
      }));
      setIsSettingsOpen(false);
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const clearError = () => {
    setError(null);
  };

  // Listener para mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id, session?.user?.email_confirmed_at);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('Processando login/refresh...');
        await handleAuthChange(session);
      } else if (event === 'SIGNED_UP') {
        console.log('Usuário registrado:', session?.user?.id);
        // Para signup, verificar se há sessão ativa
        if (session) {
          console.log('Sessão ativa após signup, processando...');
          await handleAuthChange(session);
        } else {
          console.log('Signup sem sessão - aguardando confirmação de email');
          setError('Conta criada! Verifique seu email para ativar a conta.');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Usuário deslogado');
        setAuthState(prev => ({
          ...prev,
          user: null,
          tenant: null,
          isAuthenticated: false,
          needsCompany: false,
          isLoading: false
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    ...authState,
    loginWithGoogle,
    loginWithPassword,
    signUpWithPassword,
    logout,
    createCompany,
    error,
    clearError,
    isSettingsOpen,
    openSettings,
    closeSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth deve ser usado dentro de AuthProvider');
    // Return default values instead of throwing to prevent crashes
    return {
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      needsCompany: false,
      loginWithGoogle: async () => {},
      loginWithPassword: async () => {},
      signUpWithPassword: async () => {},
      logout: async () => {},
      createCompany: async () => {},
      error: null,
      clearError: () => {},
      isSettingsOpen: false,
      openSettings: () => {},
      closeSettings: () => {}
    };
  }
  return context;
}