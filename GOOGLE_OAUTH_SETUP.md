# Configuração Google OAuth - Hub.App

## ✅ Status Atual

A implementação do Google OAuth já está **100% completa** no código:

- ✅ **Botão "Continuar com Google"** implementado no LoginPage
- ✅ **Função `loginWithGoogle()`** no useAuth hook  
- ✅ **Supabase OAuth integration** configurada
- ✅ **Design idêntico** à sua captura de tela

## ⚙️ Configuração Necessária no Supabase

Para ativar o Google OAuth, você precisa configurar no **Supabase Dashboard**:

### 1. Acessar Supabase Dashboard
1. Vá para https://supabase.com/dashboard
2. Acesse seu projeto Hub.App
3. No menu lateral, clique em **"Authentication"**
4. Clique em **"Providers"**

### 2. Configurar Google Provider
1. Encontre **"Google"** na lista de provedores
2. **Ative** o toggle do Google
3. Configure os campos obrigatórios:

```
Site URL: https://seu-dominio-vercel.app
Redirect URLs: https://seu-dominio-vercel.app/auth/callback
```

### 3. Obter Credenciais Google
Você precisa criar um projeto no **Google Cloud Console**:

#### 3.1 Google Cloud Console
1. Acesse https://console.cloud.google.com
2. Crie um novo projeto ou use existente
3. Ative a **Google+ API** ou **Google Identity API**

#### 3.2 OAuth 2.0 Credentials
1. Vá em **"APIs & Services"** > **"Credentials"**
2. Clique **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
3. Tipo: **"Web application"**
4. Configure:

```
Name: Hub.App
Authorized JavaScript origins:
  - http://localhost:3000 (para development)  
  - https://seu-dominio-vercel.app (para production)

Authorized redirect URIs:
  - http://localhost:3000/auth/callback (development)
  - https://seu-dominio-vercel.app/auth/callback (production)
```

#### 3.3 Copiar Credenciais
Após criar, você receberá:
- **Client ID** (exemplo: 123456789-abc123.apps.googleusercontent.com)
- **Client Secret** (exemplo: GOCSPX-abcd1234...)

### 4. Configurar no Supabase
De volta ao Supabase Dashboard > Authentication > Providers > Google:

```
Client ID: [seu-client-id-google]
Client Secret: [seu-client-secret-google]
Redirect URL: https://[projeto-id].supabase.co/auth/v1/callback
```

### 5. URLs de Callback
Adicione no Google Cloud Console as URLs corretas:
- **Development**: `https://[projeto-id].supabase.co/auth/v1/callback`
- **Production**: `https://[projeto-id].supabase.co/auth/v1/callback`

## 🧪 Testar Implementação

### Development (localhost)
1. Configure o Google OAuth com `http://localhost:3000`
2. No Supabase, adicione localhost nas URLs permitidas
3. Teste o botão "Continuar com Google"

### Production (Vercel)
1. Configure com sua URL do Vercel
2. Teste após deploy

## 🔧 Debug

Se não funcionar, verifique:

1. **Console do navegador** - erros de CORS ou configuração
2. **Supabase Dashboard** > Logs - erros de autenticação
3. **Google Cloud Console** > APIs - se as APIs estão ativas
4. **URLs corretas** - devem bater exatamente

## 🎯 Resultado

Após configurar:
- ✅ Botão funciona perfeitamente
- ✅ Login com Google cria conta automaticamente  
- ✅ Usuário é redirecionado para configurar empresa
- ✅ Experiência igual a outros logins sociais

## 📧 Suporte

Se precisar de ajuda com a configuração:
1. Compartilhe prints dos erros no console
2. Verifique se as URLs estão corretas
3. Confirme se as APIs estão ativas no Google Cloud

**O código já está 100% pronto - só precisa da configuração no Supabase + Google Cloud!**