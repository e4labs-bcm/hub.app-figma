# 🔐 Integração com Google OAuth

Este guia mostra como integrar autenticação real do Google na aplicação Família.

## 📋 Configuração do Google Cloud Console

### 1. Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google+ API" e "Google Identity API"

### 2. Configurar OAuth 2.0

1. Vá para **APIs & Services > Credentials**
2. Clique em **Create Credentials > OAuth 2.0 Client IDs**
3. Configure:
   - **Application type**: Web application
   - **Name**: Portal Família
   - **Authorized origins**: 
     - `http://localhost:3000` (desenvolvimento)
     - `https://seudominio.com` (produção)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback`
     - `https://seudominio.com/auth/callback`

### 3. Obter credenciais

- **Client ID**: Será usado no frontend
- **Client Secret**: Será usado no backend (mantenha seguro!)

## 🔧 Implementação Frontend

### 1. Instalar dependências

```bash
npm install @google-cloud/local-auth googleapis
```

### 2. Configurar variáveis de ambiente

```bash
# .env
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001/api
```

### 3. Atualizar hook useAuth

```typescript
// hooks/useAuth.tsx
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  familyName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
    loadGoogleScript();
  }, []);

  const loadGoogleScript = () => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };

  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem('familia_auth_token');
      if (token) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('familia_auth_token');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        setIsLoading(true);
        setError(null);

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              // Enviar token para o backend
              const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  token: response.credential 
                }),
              });

              if (backendResponse.ok) {
                const { user, token } = await backendResponse.json();
                localStorage.setItem('familia_auth_token', token);
                setUser(user);
                resolve();
              } else {
                const error = await backendResponse.json();
                throw new Error(error.message || 'Erro ao fazer login');
              }
            } catch (error) {
              setError('Erro ao processar login com Google');
              reject(error);
            } finally {
              setIsLoading(false);
            }
          },
        });

        window.google.accounts.id.prompt();
      } catch (error) {
        setError('Erro ao inicializar Google OAuth');
        setIsLoading(false);
        reject(error);
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('familia_auth_token');
    setUser(null);
    window.google?.accounts.id.disableAutoSelect();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      loginWithGoogle,
      logout,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
```

### 4. Atualizar componente LoginPage

```typescript
// components/LoginPage.tsx
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { loginWithGoogle, isLoading, error } = useAuth();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Verificar se o Google script carregou
    const checkGoogleLoaded = () => {
      if (window.google && window.google.accounts) {
        setIsGoogleLoaded(true);
      } else {
        setTimeout(checkGoogleLoaded, 100);
      }
    };
    checkGoogleLoaded();
  }, []);

  const handleGoogleLogin = async () => {
    if (!isGoogleLoaded) {
      setError('Google não carregado ainda. Tente novamente.');
      return;
    }
    
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  return (
    // ... resto do componente igual ao anterior
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading || !isGoogleLoaded}
      className="w-full h-14 bg-white hover:bg-gray-50 text-gray-800"
    >
      {isLoading ? 'Conectando...' : 'Continuar com Google'}
    </Button>
  );
}
```

## 🚀 Implementação Backend (Node.js/Express)

### 1. Instalar dependências

```bash
npm install express google-auth-library jsonwebtoken cors dotenv
```

### 2. Configurar servidor

```javascript
// server.js
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// Verificar token Google
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Token inválido');
  }
}

// Login com Google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verificar token do Google
    const payload = await verifyGoogleToken(token);
    
    // Buscar ou criar usuário no banco de dados
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
      familyName: 'Família ' + payload.family_name || payload.name.split(' ')[0]
    };
    
    // Gerar JWT
    const authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ user, token: authToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Validar token
app.get('/api/auth/validate', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar dados do usuário no banco
    const user = getUserById(decoded.userId); // Implementar busca no banco
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});
```

### 3. Variáveis de ambiente (backend)

```bash
# .env
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
DATABASE_URL=sua_connection_string_do_banco
```

## 🛡️ Considerações de Segurança

### 1. Validação de tokens
- Sempre valide tokens no backend
- Use JWT com expiração adequada
- Implemente refresh tokens para sessões longas

### 2. Proteção de dados
- Não armazene informações sensíveis no localStorage
- Use HTTPS em produção
- Configure CORS adequadamente

### 3. Gerenciamento de sessão
```typescript
// Middleware para verificar autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};
```

## 📱 Teste da Integração

### 1. Ambiente de desenvolvimento
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Verificar funcionamento
1. Abra `http://localhost:3000`
2. Clique em "Continuar com Google"
3. Faça login com sua conta Google
4. Verifique se o usuário aparece na sidebar
5. Teste o logout

### 3. Debug comum
- Verificar se as URLs de redirect estão corretas
- Confirmar que as APIs estão ativadas no Google Cloud
- Validar se as variáveis de ambiente estão carregadas
- Checar logs do console para erros de CORS

## 🚀 Deploy em Produção

### 1. Frontend (Vercel/Netlify)
```bash
# Configurar variáveis de ambiente
VITE_GOOGLE_CLIENT_ID=...
VITE_API_URL=https://api.seudominio.com
```

### 2. Backend (Railway/Heroku/DigitalOcean)
```bash
# Configurar variáveis de ambiente
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=...
```

### 3. Atualizar URLs no Google Cloud Console
- Adicionar domínios de produção
- Configurar redirect URIs corretos
- Testar em ambiente de produção

---

Com esta implementação, você terá autenticação Google completa e segura! 🔐✨