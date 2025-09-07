# 📝 Guidelines de Código - Hub.App

Este documento define os padrões de código, convenções e boas práticas para o desenvolvimento do Hub.App.

## 🎯 Princípios Gerais

### Código Limpo
- **Legibilidade** acima de performance prematura
- **Simplicidade** sobre complexidade
- **Consistência** em toda a codebase
- **Manutenibilidade** para o futuro

### Responsabilidades
- **Um componente, uma responsabilidade**
- **Hooks customizados** para lógica reutilizável  
- **Separação** de apresentação e lógica
- **Props interface** bem definidas

## 🏗️ Estrutura de Arquivos

### Organização de Pastas
```
src/
├── components/
│   ├── ui/                 # Design System (Radix UI)
│   ├── settings/           # Páginas de configuração
│   ├── figma/             # Componentes específicos do Figma
│   └── *.tsx              # Componentes de feature
├── hooks/                 # Hooks customizados
├── lib/                   # Configurações e utilitários
├── utils/                 # Funções auxiliares
└── styles/                # Estilos globais
```

### Convenções de Nomenclatura
- **Componentes**: `PascalCase` (`AnimatedAppGrid`)
- **Hooks**: `camelCase` com prefixo "use" (`useAuth`)
- **Arquivos**: `kebab-case` (`background-settings.tsx`)
- **Variáveis**: `camelCase` (`isLoading`)
- **Constantes**: `UPPER_SNAKE_CASE` (`PROJECT_ID`)

## ⚛️ Padrões React

### Estrutura de Componentes
```typescript
// ✅ Estrutura padrão recomendada
import { useState, useEffect } from 'react';
import { ComponentProps } from './types'; // Se necessário

interface ComponentNameProps {
  // Props obrigatórias primeiro
  title: string;
  onAction: () => void;
  // Props opcionais depois
  isLoading?: boolean;
  className?: string;
}

export function ComponentName({ 
  title, 
  onAction, 
  isLoading = false,
  className = ""
}: ComponentNameProps) {
  // Hooks no topo
  const [localState, setLocalState] = useState(false);
  
  // Effects após hooks de estado
  useEffect(() => {
    // Effect logic
  }, []);

  // Funções auxiliares
  const handleAction = () => {
    // Logic
    onAction();
  };

  // Render
  return (
    <div className={cn("base-classes", className)}>
      {/* JSX */}
    </div>
  );
}
```

### Props Interface
```typescript
// ✅ Interface bem definida
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

// ❌ Evite any ou object genérico
interface BadProps {
  data: any; // ❌
  config: object; // ❌
}
```

### Hooks Customizados
```typescript
// ✅ Hook bem estruturado
export function useAuth() {
  const [state, setState] = useState(initialState);
  
  // Lógica do hook
  const login = useCallback(async (credentials) => {
    // Implementation
  }, []);

  // Retorne objeto estável
  return useMemo(() => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    login,
    logout
  }), [state.user, state.isAuthenticated, login]);
}
```

## 🎨 Padrões de Estilo

### Tailwind CSS
```typescript
// ✅ Classes organizadas e legíveis
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing  
  "p-4 gap-3",
  // Visual
  "bg-white rounded-lg border",
  // Responsive
  "md:p-6 md:gap-4",
  // Conditional
  isActive && "bg-blue-50 border-blue-200",
  className
)}>
```

### Utility Function cn()
```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 🔄 Gerenciamento de Estado

### Context + Hooks Pattern
```typescript
// ✅ Padrão usado no projeto
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  
  const value = useMemo(() => ({
    // Estado e ações
  }), [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Estado Local vs Global
- **Local**: Estado específico do componente
- **Global**: Estado compartilhado entre componentes
- **Server State**: Dados do servidor (com Supabase)

## 🔐 Segurança

### Validação de Props
```typescript
// ✅ Validação adequada
interface UserProfileProps {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

function UserProfile({ user }: UserProfileProps) {
  if (!user?.id) {
    return <div>Usuário inválido</div>;
  }
  // Render component
}
```

### Sanitização de Dados
```typescript
// ✅ Sanitize user input
const sanitizedTitle = title?.trim().substring(0, 100);

// ✅ Validate permissions
if (!hasPermission('module.read')) {
  return <AccessDenied />;
}
```

## 📱 Responsividade

### Mobile-First Classes
```typescript
// ✅ Mobile-first approach
<div className={cn(
  // Mobile (padrão)
  "p-4 text-sm",
  // Tablet
  "md:p-6 md:text-base",
  // Desktop
  "lg:p-8 lg:text-lg"
)}>
```

### Breakpoints Utilizados
- **Mobile**: `< 768px` (padrão)
- **Tablet**: `md: 768px+`
- **Desktop**: `lg: 1024px+`

## ⚡ Performance

### React.memo para Componentes Pesados
```typescript
// ✅ Memoize expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Heavy computation or rendering
}, (prevProps, nextProps) => {
  // Custom comparison if needed
});
```

### useMemo e useCallback
```typescript
// ✅ Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// ✅ Stable function references
const handleClick = useCallback(() => {
  onAction(id);
}, [onAction, id]);
```

## 🐛 Error Handling

### Tratamento de Erros
```typescript
// ✅ Proper error handling
try {
  const result = await apiCall();
  setData(result);
} catch (error) {
  console.error('Error details:', error);
  setError('Mensagem amigável para o usuário');
}
```

### Error Boundaries
```typescript
// Para componentes críticos
<ErrorBoundary fallback={<ErrorFallback />}>
  <CriticalComponent />
</ErrorBoundary>
```

## 📝 Comentários e Documentação

### JSDoc para Funções Complexas
```typescript
/**
 * Calcula o preço com desconto baseado no plano do usuário
 * @param basePrice - Preço base do produto
 * @param userPlan - Plano do usuário ('free' | 'pro' | 'enterprise')
 * @returns Preço final com desconto aplicado
 */
function calculateDiscountedPrice(
  basePrice: number, 
  userPlan: UserPlan
): number {
  // Implementation
}
```

### Comentários Úteis
```typescript
// ✅ Explica o "porquê", não o "como"
// Necessário para compatibilidade com iOS Safari
const iosWorkaround = window.visualViewport?.height || window.innerHeight;

// ❌ Evite comentários óbvios  
const isVisible = true; // Define visibility as true
```

## 🧪 Testing Patterns

### Component Testing
```typescript
// Estrutura básica de teste (quando implementado)
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interactions', () => {
    // Test implementation  
  });
});
```

## ✅ Checklist de Code Review

### Antes de fazer commit:
- [ ] Componente segue estrutura padrão
- [ ] Props interface bem definida
- [ ] Responsividade mobile-first
- [ ] Error handling adequado
- [ ] Performance considerada
- [ ] Segurança validada
- [ ] Nomes descritivos usados
- [ ] Código limpo e legível

---

## 📚 Recursos Adicionais

- [Estrutura de Componentes](./components-structure.md)
- [Design System](./design-system.md)
- [Sistema de Estado](./state-management.md)
- [Performance Guidelines](./performance.md)