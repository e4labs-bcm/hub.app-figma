# 🚀 Environment Setup - Hub.App

Guia completo para configuração do ambiente de desenvolvimento do Hub.App.

## 🔧 Pré-requisitos

### Sistema Operacional
- **Windows 10+** / **macOS 10.14+** / **Linux Ubuntu 18.04+**
- **Node.js 18.x** ou superior
- **npm 9.x** ou **yarn 1.22+**

### Ferramentas Necessárias
```bash
# Verificar versões instaladas
node --version    # v18.x+
npm --version     # 9.x+
git --version     # 2.x+
```

## 📦 Instalação

### 1. Clone do Repositório
```bash
git clone https://github.com/e4labs-bcm/hub.app-figma.git
cd hub.app-figma
```

### 2. Instalação de Dependências
```bash
# Usando npm
npm install

# Ou usando yarn
yarn install
```

### 3. Configuração de Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar variáveis necessárias
nano .env.local
```

### Variáveis de Ambiente Necessárias
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Settings
VITE_APP_NAME=Hub.App
VITE_APP_VERSION=1.0.0

# Development Settings
VITE_DEV_MODE=true
VITE_API_BASE_URL=http://localhost:3000
```

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha os dados do projeto
4. Aguarde a criação (2-3 minutos)

### 2. Configurar Database Schema
```bash
# Executar schema no Supabase Dashboard
# SQL Editor > New Query > Cole o conteúdo de supabase-schema.sql
```

### 3. Configurar Authentication
```sql
-- Habilitar provedores de auth
-- Authentication > Settings > Auth Providers
-- Habilitar: Email, Google (opcional)
```

### 4. Row Level Security (RLS)
```sql
-- As políticas RLS são criadas automaticamente pelo schema
-- Verificar se estão ativas em Database > Tables
```

## 🎨 Configuração do Editor

### VS Code (Recomendado)
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

### Extensões Recomendadas
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🔄 Scripts de Desenvolvimento

### Scripts Principais
```bash
# Desenvolvimento
npm run dev              # Servidor local
npm run dev:host         # Servidor com acesso de rede
npm run dev:mobile       # Otimizado para mobile

# Build
npm run build            # Build de produção
npm run preview          # Preview do build

# Qualidade de Código
npm run lint             # Verificar ESLint
npm run lint:fix         # Corrigir ESLint automaticamente
npm run type-check       # Verificar TypeScript
```

### Scripts Customizados
```json
// package.json scripts section
{
  "dev:network": "vite --host 0.0.0.0 --port 3000",
  "dev:https": "vite --https --host 0.0.0.0",
  "clean": "rm -rf dist node_modules",
  "reset": "npm run clean && npm install"
}
```

## 📱 Desenvolvimento Mobile

### Testar no Dispositivo Móvel
```bash
# 1. Descobrir IP da máquina
ipconfig getifaddr en0    # macOS
hostname -I               # Linux  
ipconfig                  # Windows

# 2. Executar com host
npm run dev:host

# 3. Acessar no mobile
# http://192.168.x.x:3000
```

### Ferramentas de Debug Mobile
- **Chrome DevTools** - Remote debugging
- **Safari Web Inspector** - Para iOS
- **Eruda** - Console mobile (se necessário)

## 🛠️ Troubleshooting

### Problemas Comuns

#### Erro de Dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### Erro de TypeScript
```bash
# Verificar tipos
npm run type-check

# Regenerar tipos do Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID
```

#### Erro de Build
```bash
# Build com logs detalhados
npm run build -- --verbose

# Verificar se todas as variáveis estão definidas
echo $VITE_SUPABASE_URL
```

### Logs de Debug
```typescript
// Habilitar logs detalhados
localStorage.setItem('debug', 'hub:*');

// Ou via .env
VITE_DEBUG_MODE=true
```

## 🔒 Configuração de Segurança

### Desenvolvimento Local
```env
# .env.local (não commitar)
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Produção
- Usar variáveis de ambiente do deploy
- Configurar CORS no Supabase
- Habilitar RLS em todas as tabelas

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Configuração de Build
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 📚 Próximos Passos

1. [Getting Started](./getting-started.md) - Primeiro uso
2. [Architecture](./architecture.md) - Entender a arquitetura  
3. [Coding Guidelines](./coding-guidelines.md) - Padrões de código
4. [Components Structure](./components-structure.md) - Organização de componentes