# 🔐 Authentication System - Hub.App

Sistema de autenticação completo com Supabase Auth e integração multi-tenant.

## 🎯 Visão Geral

O Hub.App utiliza **Supabase Authentication** com:
- Autenticação por email/senha
- Login social (Google) - opcional
- Multi-tenancy com isolamento por empresa
- Gerenciamento de sessões automático
- Row Level Security (RLS) integrado

## 🏗️ Arquitetura

### Fluxo de Autenticação
```
1. User Login → Supabase Auth
2. Get Auth User → auth.users table  
3. Fetch Profile → perfis table (with tenant_id)
4. Set Context → AuthProvider state
5. RLS Activation → All queries filtered by tenant_id
```

### Estrutura de Dados
```sql
-- Supabase Auth (gerenciado automaticamente)
auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ
)

-- Profile customizado (nossa tabela)
perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  nome_completo TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true
)
```

## ⚛️ Implementação Frontend

### AuthProvider Context
```typescript
// src/hooks/useAuth.tsx
interface AuthContextType {
  user: Perfil | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState({
    user: null,
    tenant: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Listener para mudanças de auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setAuthState(prev => ({
            ...prev,
            user: null,
            tenant: null,
            isAuthenticated: false
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('perfis')
        .select(`
          *,
          tenants (*)
        `)
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      setAuthState({
        user: profile,
        tenant: profile.tenants,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };
}
```

### Login Implementation
```typescript
const login = async (email: string, password: string) => {
  try {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // loadUserProfile é chamado automaticamente pelo listener
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Credenciais inválidas');
  }
};
```

### Signup with Company Creation
```typescript
const signUp = async (data: {
  email: string;
  password: string;
  nome_completo: string;
  nome_empresa: string;
  cnpj?: string;
}) => {
  try {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // 2. Criar perfil e empresa via RPC
    const { data: result, error: rpcError } = await supabase.rpc('create_new_tenant', {
      company_name: data.nome_empresa,
      company_cnpj: data.cnpj,
      company_email: data.email,
      user_id: authData.user.id
    });

    if (rpcError) throw rpcError;

    // 3. Criar perfil do usuário
    const { error: profileError } = await supabase
      .from('perfis')
      .insert({
        id: authData.user.id,
        tenant_id: result.tenant_id,
        nome_completo: data.nome_completo,
        email: data.email,
        role: 'admin'
      });

    if (profileError) throw profileError;

    return result;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};
```

## 🔒 Row Level Security (RLS)

### Políticas de Segurança
```sql
-- Função helper para obter tenant do usuário logado
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT p.tenant_id INTO tenant_id
  FROM perfis p
  WHERE p.id = auth.uid() AND p.is_active = true;
  
  RETURN tenant_id;
END;
$$;

-- Política para perfis
CREATE POLICY "Users can only see profiles from their tenant" ON perfis
  FOR ALL USING (tenant_id = get_my_tenant_id());

-- Política para módulos do usuário
CREATE POLICY "Users can only access their tenant modules" ON user_modules
  FOR ALL USING (tenant_id = get_my_tenant_id());

-- Habilitar RLS
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;
```

### Verificação de Permissões
```sql
-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_tenant_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT p.role INTO user_role
  FROM perfis p
  WHERE p.id = auth.uid();
  
  RETURN user_role IN ('admin', 'super_admin');
END;
$$;
```

## 🔑 Gestão de Sessões

### Persistência de Sessão
```typescript
// Supabase mantém sessão automaticamente no localStorage
// Configuração no supabase client:
const supabase = createClient(url, anonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

### Refresh Token Automático
```typescript
// Supabase gerencia refresh automaticamente
// Para verificar status da sessão:
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Usuário está autenticado
      await loadUserProfile(session.user.id);
    }
  };

  checkSession();
}, []);
```

## 🚪 Login Social (Google)

### Configuração no Supabase
```sql
-- No Supabase Dashboard:
-- Authentication > Settings > Auth Providers
-- Google OAuth Configuration:
-- Client ID: your_google_client_id
-- Client Secret: your_google_client_secret
-- Redirect URL: https://your-project.supabase.co/auth/v1/callback
```

### Implementação
```typescript
const loginWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};
```

## 👥 Gestão de Usuários

### Convite de Usuários
```typescript
const inviteUser = async (email: string, role: string) => {
  const { user } = useAuth();
  
  // Só admin pode convidar
  if (user?.role !== 'admin') {
    throw new Error('Permissão negada');
  }

  try {
    // 1. Criar convite na tabela
    const { data: invite, error: inviteError } = await supabase
      .from('user_invites')
      .insert({
        tenant_id: user.tenant_id,
        email,
        role,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // 2. Enviar email de convite (via Edge Function)
    await supabase.functions.invoke('send-invite-email', {
      body: {
        email,
        invite_token: invite.id,
        company_name: user.tenants.nome_empresa
      }
    });

    return invite;
  } catch (error) {
    console.error('Invite error:', error);
    throw error;
  }
};
```

### Aceitar Convite
```typescript
const acceptInvite = async (token: string, userData: {
  password: string;
  nome_completo: string;
}) => {
  try {
    // 1. Verificar convite válido
    const { data: invite, error: inviteError } = await supabase
      .from('user_invites')
      .select('*, tenants(*)')
      .eq('id', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) {
      throw new Error('Convite inválido ou expirado');
    }

    // 2. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invite.email,
      password: userData.password
    });

    if (authError) throw authError;

    // 3. Criar perfil do usuário
    const { error: profileError } = await supabase
      .from('perfis')
      .insert({
        id: authData.user!.id,
        tenant_id: invite.tenant_id,
        nome_completo: userData.nome_completo,
        email: invite.email,
        role: invite.role
      });

    if (profileError) throw profileError;

    // 4. Marcar convite como aceito
    await supabase
      .from('user_invites')
      .update({ status: 'accepted', accepted_at: new Date() })
      .eq('id', token);

    return authData;
  } catch (error) {
    console.error('Accept invite error:', error);
    throw error;
  }
};
```

## 🛡️ Segurança

### Validações
```typescript
// Validação de email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de senha
const isValidPassword = (password: string) => {
  return password.length >= 8;
};

// Validação de permissões
const hasPermission = (permission: string) => {
  const { user } = useAuth();
  if (!user) return false;
  
  // Super admin tem todas as permissões
  if (user.role === 'super_admin') return true;
  
  // Verificar permissão específica
  return user.permissions?.includes(permission) || false;
};
```

### Rate Limiting
```sql
-- Configurado no Supabase Dashboard
-- Authentication > Settings > Rate Limits
-- Login attempts: 5 per minute per IP
-- Signup attempts: 3 per minute per IP
```

## 🔄 Logout e Cleanup

### Logout Implementation
```typescript
const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Limpar estado local
    setAuthState({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    // Redirecionar para login
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

---

## 📚 Recursos Relacionados

- [Multi-tenancy](./multi-tenancy.md) - Sistema multi-tenant
- [Permissions](./permissions.md) - Sistema de permissões  
- [Database Schema](./database-schema.md) - Schema do banco
- [Supabase Setup](./supabase-setup.md) - Configuração do Supabase