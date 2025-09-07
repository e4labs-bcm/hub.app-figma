# 🧩 Components Structure - Hub.App

Documentação completa da estrutura de componentes do Hub.App.

## 🏗️ Organização de Arquivos

### Estrutura de Pastas
```
src/components/
├── ui/                     # Design System Components (Radix UI)
│   ├── button.tsx         # Componente Button base
│   ├── input.tsx          # Componente Input base
│   ├── card.tsx           # Componente Card base
│   └── ...                # Outros componentes UI
├── settings/              # Páginas de Configuração
│   ├── background-settings.tsx
│   ├── company-settings.tsx
│   ├── user-settings.tsx
│   └── notifications-settings.tsx
├── figma/                 # Componentes específicos do Figma
│   ├── animated-app-grid.tsx
│   ├── app-sidebar.tsx
│   └── ...
└── *.tsx                  # Componentes de feature principais
```

## 📋 Componentes Principais

### 1. AnimatedAppGrid.tsx
**Função**: Grid principal de aplicativos/módulos com animações
```typescript
interface AnimatedAppGridProps {
  modules: Module[];
  onModuleClick?: (module: Module) => void;
  isLoading?: boolean;
}

// Features:
// - Grid responsivo 4x4 (mobile) / 6x6 (desktop)
// - Animações Framer Motion
// - Integração com sistema de módulos
// - Estados de loading
```

### 2. AppSidebar.tsx  
**Função**: Barra lateral de navegação (desktop)
```typescript
interface AppSidebarProps {
  user: Perfil;
  modules: Module[];
  onLogout: () => void;
}

// Features:
// - Navegação por módulos
// - Informações do usuário
// - Notificações integradas
// - Design adaptável
```

### 3. BackgroundSettings.tsx
**Função**: Configuração de papel de parede
```typescript
interface BackgroundSettingsProps {
  onClose: () => void;
}

// Features:
// - Upload de imagens (até 2MB)
// - Galeria de imagens pré-definidas
// - Detecção mobile/desktop
// - Preview em tempo real
```

## 🎨 Componentes UI (Design System)

### Button Component
```typescript
// src/components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

// Uso:
<Button variant="outline" size="sm">
  Cancelar
</Button>
```

### Card Component
```typescript
// src/components/ui/card.tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
);

// Subcomponentes:
// - CardHeader
// - CardContent
// - CardTitle
// - CardDescription
```

### Input Component
```typescript
// src/components/ui/input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn("flex h-10 w-full rounded-md border", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
```

## 🔧 Hooks e Utilities

### Hooks Customizados Usados
```typescript
// Principais hooks do projeto
useAuth()          // Autenticação e usuário
useSettings()      // Configurações globais
useModules()       // Sistema de módulos
usePermissions()   // Controle de permissões
useNotifications() // Sistema de notificações
```

### Utility Functions
```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Uso em componentes:
className={cn("base-classes", conditionalClass && "extra-class", className)}
```

## 📱 Padrões de Componentes

### Estrutura Padrão de Componente
```typescript
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Props obrigatórias
  title: string;
  onAction: () => void;
  
  // Props opcionais
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({ 
  title, 
  onAction, 
  isLoading = false,
  className = "",
  children 
}: ComponentNameProps) {
  // 1. Hooks de estado
  const [localState, setLocalState] = useState(false);
  
  // 2. Hooks de efeito
  useEffect(() => {
    // Effect logic
  }, []);

  // 3. Funções auxiliares
  const handleAction = () => {
    // Logic here
    onAction();
  };

  // 4. Render condicional antecipado
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 5. JSX principal
  return (
    <div className={cn("base-classes", className)}>
      <h2>{title}</h2>
      {children}
      <button onClick={handleAction}>
        Action
      </button>
    </div>
  );
}
```

### Padrão de Props Interface
```typescript
// ✅ Interface bem definida
interface ModuleCardProps {
  module: {
    id: string;
    nome: string;
    icone_lucide: string;
    cor_gradiente?: string;
    is_premium?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

// ❌ Evite tipos genéricos
interface BadProps {
  data: any;
  config: object;
}
```

## 🎭 Estados e Tratamento de Erros

### Loading States
```typescript
function ComponentWithLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded">
        Erro: {error}
      </div>
    );
  }

  return <div>/* Conteúdo normal */</div>;
}
```

### Empty States
```typescript
function EmptyState({ 
  title, 
  description, 
  action 
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-4">
        {description}
      </p>
      {action}
    </div>
  );
}
```

## 🔄 Animações com Framer Motion

### Padrões de Animação Usados
```typescript
// Fade In básico
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// Scale + Hover para botões/cards
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>

// Slide In para modais/sidebars
<motion.div
  initial={{ opacity: 0, x: -300 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -300 }}
  transition={{ type: "spring", damping: 25, stiffness: 120 }}
>

// Stagger para listas
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
    />
  ))}
</motion.div>
```

## 📱 Responsividade

### Breakpoints e Padrões
```typescript
// Mobile-First Classes
<div className={cn(
  // Mobile (padrão)
  "p-4 text-sm grid grid-cols-4 gap-3",
  // Tablet
  "md:p-6 md:text-base md:grid-cols-6 md:gap-4",
  // Desktop
  "lg:p-8 lg:text-lg"
)}>

// Renderização condicional por tamanho
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

return isMobile ? <MobileComponent /> : <DesktopComponent />;
```

## 🧪 Testing Patterns (Futuro)

### Estrutura de Testes
```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  const mockProps = {
    title: 'Test Title',
    onAction: jest.fn()
  };

  beforeEach(() => {
    mockProps.onAction.mockClear();
  });

  it('renders correctly', () => {
    render(<ComponentName {...mockProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<ComponentName {...mockProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockProps.onAction).toHaveBeenCalledTimes(1);
  });
});
```

## ⚡ Performance

### Otimizações Implementadas
```typescript
// React.memo para componentes pesados
export const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});

// useMemo para cálculos custosos
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// useCallback para funções estáveis
const handleClick = useCallback(() => {
  onAction(id);
}, [onAction, id]);
```

---

## 📚 Recursos Relacionados

- [Design System](./design-system.md) - Componentes UI detalhados
- [Coding Guidelines](./coding-guidelines.md) - Padrões de código
- [State Management](./state-management.md) - Hooks e contextos
- [Architecture](./architecture.md) - Visão geral da arquitetura