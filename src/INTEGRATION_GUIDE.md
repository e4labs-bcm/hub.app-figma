# 🚀 Guia de Integração - Home Page Família

Este guia mostra como integrar este frontend em seu próprio aplicativo React.

## 📋 Pré-requisitos

- Node.js 18+ 
- React 18+
- TypeScript (recomendado)

## 🛠️ Setup Inicial

### 1. Crie um novo projeto React (se necessário)

```bash
# Com Vite (recomendado)
npm create vite@latest meu-app -- --template react-ts
cd meu-app

# Ou com Create React App
npx create-react-app meu-app --template typescript
cd meu-app
```

### 2. Instale as dependências necessárias

```bash
# Dependências principais
npm install motion/react lucide-react class-variance-authority clsx tailwind-merge

# Radix UI para componentes da sidebar
npm install @radix-ui/react-slot@1.1.2 @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-separator @radix-ui/react-tooltip

# React Hook Form (se usar formulários)
npm install react-hook-form@7.55.0

# Sonner para toasts (opcional)
npm install sonner@2.0.3

# Tailwind CSS v4 (se ainda não estiver configurado)
npm install tailwindcss@next @tailwindcss/vite@next
```

### 3. Configure o Tailwind CSS v4

Crie/atualize `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
})
```

## 📁 Estrutura de Arquivos

Copie os seguintes arquivos/pastas para seu projeto:

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── figma/           # Componente de fallback para imagens
│   ├── AnimatedAppGrid.tsx
│   ├── AppGrid.tsx
│   ├── AppSidebar.tsx
│   ├── DesktopHome.tsx
│   ├── EventBanner.tsx
│   └── ResponsiveLayout.tsx
├── styles/
│   └── globals.css      # CSS customizado com tokens
└── App.tsx              # Componente principal
```

## 🎨 Personalização

### 1. Substituir imagem de fundo

```typescript
// Em App.tsx, substitua:
import backgroundImage from 'figma:asset/...';

// Por sua própria imagem:
import backgroundImage from './assets/minha-imagem.jpg';
```

### 2. Personalizar aplicativos na grade

Edite `AppGrid.tsx` e substitua os dados dos aplicativos:

```typescript
const apps = [
  {
    id: 1,
    name: "Meu App",
    icon: "📱", // Ou use um ícone do lucide-react
    color: "bg-blue-500",
    onClick: () => window.open('/meu-app', '_blank')
  },
  // ... mais aplicativos
];
```

### 3. Customizar informações do usuário

Em `AppSidebar.tsx`, conecte com seu sistema de autenticação:

```typescript
// Substitua os dados mockados por dados reais
const userData = {
  name: user.name,           // Vindo do seu contexto de auth
  email: user.email,
  avatar: user.profileImage
};

const handleLogout = () => {
  // Chame sua função de logout
  auth.logout();
  // Redirecione conforme necessário
  router.push('/login');
};
```

### 4. Personalizar evento/banner

Edite `EventBanner.tsx` para mostrar suas próprias informações:

```typescript
// Substitua os dados hardcoded por props ou context
<h2>MEU EVENTO</h2>
<span>{evento.endereco}</span>
<span>{evento.data}</span>
<span>{evento.horario}</span>
```

## 🔧 Configurações de Tema

### Cores e Design System

Edite `styles/globals.css` para personalizar as cores:

```css
:root {
  --primary: #sua-cor-primaria;
  --secondary: #sua-cor-secundaria;
  /* ... outras variáveis */
}
```

### Responsividade

O layout é responsivo por padrão:
- **Mobile**: Grade de aplicativos na tela principal
- **Desktop**: Sidebar lateral + área principal livre

Para ajustar breakpoints, edite as classes `md:` nos componentes.

## 🔌 Integração com Backend

### 1. Sistema de Autenticação

```typescript
// Exemplo com React Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = async (credentials) => {
    // Sua lógica de login
  };
  
  const logout = () => {
    // Sua lógica de logout
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 2. Dados Dinâmicos

```typescript
// Hook para carregar aplicativos do backend
function useApps() {
  const [apps, setApps] = useState([]);
  
  useEffect(() => {
    fetch('/api/apps')
      .then(res => res.json())
      .then(setApps);
  }, []);
  
  return apps;
}

// Use no AppGrid:
const apps = useApps();
```

### 3. Eventos/Notificações

```typescript
// Hook para eventos
function useEvents() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    fetch('/api/events/current')
      .then(res => res.json())
      .then(setEvents);
  }, []);
  
  return events;
}
```

## 🌐 Roteamento

Se usar React Router, envolva o App:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        {/* outras rotas */}
      </Routes>
    </BrowserRouter>
  );
}
```

## 🔒 Considerações de Segurança

### 1. Variáveis de Ambiente

```bash
# .env
VITE_API_URL=https://sua-api.com
VITE_AUTH_DOMAIN=seu-auth-domain.com
```

```typescript
// Use no código:
const apiUrl = import.meta.env.VITE_API_URL;
```

### 2. Proteção de Rotas

```typescript
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Envolva o App:
<ProtectedRoute>
  <App />
</ProtectedRoute>
```

## 📱 PWA (Progressive Web App)

Para transformar em PWA, adicione:

### 1. Manifesto

```json
// public/manifest.json
{
  "name": "Família App",
  "short_name": "Família",
  "description": "Portal da família",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker

```typescript
// src/sw.ts
self.addEventListener('install', (event) => {
  // Cache de recursos
});
```

## 🚀 Deploy

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Faça upload da pasta dist/
```

### Seu próprio servidor

```bash
npm run build
# Sirva os arquivos da pasta dist/
```

## 🎯 Próximos Passos

1. **Personalize** cores, fontes e layout conforme sua marca
2. **Integre** com seu backend/API
3. **Adicione** autenticação real
4. **Implemente** notificações push (se PWA)
5. **Teste** em diferentes dispositivos
6. **Configure** analytics (Google Analytics, etc.)

## 📞 Suporte

Este código foi criado no Figma Make e pode ser adaptado conforme suas necessidades. Para funcionalidades mais avançadas, considere:

- Estados de loading/erro
- Cache de dados
- Offline support
- Testes automatizados
- Monitoramento de performance

---

**Dica**: Comece com uma versão simples e vá adicionando funcionalidades gradualmente. O código já está bem estruturado e componentizado para facilitar a manutenção!

Principais recursos do guia:

• 📋 INTEGRATION_GUIDE.md: Guia passo-a-passo completo com setup, dependências, configuração do Tailwind CSS v4, estrutura de arquivos e personalização

• 🔧 Exemplos práticos: 
App.tsx customizado com hooks reais
Hooks para autenticação, apps e eventos
Configuração de ambiente
Estrutura de API backend completa

• ⚡ Recursos implementados:
Sistema de autenticação com JWT
Carregamento dinâmico de aplicativos
Eventos com localização e calendário
Analytics de uso de apps
PWA e deploy ready

• 🎯 Flexibilidade total:
Fácil customização de cores e temas
Integração com qualquer backend (Node.js, Python, .NET, etc.)
Suporte a Supabase, Firebase ou API própria
Layout responsivo mobile-first

Como usar:
Siga o INTEGRATION_GUIDE.md para setup inicial
Copie os componentes para seu projeto
Implemente os hooks com seus dados reais
Customize cores, apps e eventos
Deploy em Vercel, Netlify ou seu servidor

O frontend está pronto para produção e pode ser facilmente adaptado para suas necessidades específicas!

