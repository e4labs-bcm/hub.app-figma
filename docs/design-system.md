# 🎨 Design System - Hub.App

O Hub.App utiliza um design system consistente baseado em **Radix UI** + **Tailwind CSS** + **Framer Motion**.

## 🎯 Princípios de Design

### Core Values
- **Simplicidade Radical**: Interface intuitiva sem necessidade de manual
- **Mobile-First**: Otimizado para dispositivos móveis primeiro
- **Acessibilidade**: Seguindo padrões WCAG 2.1
- **Consistência**: Componentes uniformes em toda a aplicação

### Visual Hierarchy
- **Clareza visual** através de espaçamentos consistentes
- **Tipografia escalável** com sistema de tamanhos
- **Cores funcionais** para estados e ações
- **Animações sutis** que melhoram a UX

## 🎨 Paleta de Cores

### Cores Principais
```css
/* Sistema de cores Tailwind padrão usado */
primary: {
  50: #eff6ff;    /* Muito claro */
  100: #dbeafe;   /* Claro */
  500: #3b82f6;   /* Principal (Blue) */
  600: #2563eb;   /* Escuro */
  900: #1e3a8a;   /* Muito escuro */
}

secondary: {
  50: #f8fafc;    /* Muito claro */
  100: #f1f5f9;   /* Claro */  
  500: #64748b;   /* Principal (Slate) */
  600: #475569;   /* Escuro */
  900: #0f172a;   /* Muito escuro */
}
```

### Cores Funcionais
```css
/* Estados da aplicação */
success: #10b981;    /* Verde - Sucesso */
warning: #f59e0b;    /* Amarelo - Aviso */
error: #ef4444;      /* Vermelho - Erro */
info: #3b82f6;       /* Azul - Informação */
```

### Cores de Background
```css
/* Backgrounds utilizados */
background: #ffffff;     /* Fundo principal */
surface: #f8fafc;       /* Cards e superfícies */
overlay: rgba(0,0,0,0.1); /* Overlays e modals */
```

## 📝 Tipografia

### Scale de Tamanhos
```css
/* text-xs */   font-size: 0.75rem; /* 12px */
/* text-sm */   font-size: 0.875rem; /* 14px */
/* text-base */ font-size: 1rem; /* 16px - padrão */
/* text-lg */   font-size: 1.125rem; /* 18px */
/* text-xl */   font-size: 1.25rem; /* 20px */
/* text-2xl */  font-size: 1.5rem; /* 24px */
/* text-3xl */  font-size: 1.875rem; /* 30px */
/* text-4xl */  font-size: 2.25rem; /* 36px */
```

### Hierarquia Tipográfica
```typescript
// Títulos principais
<h1 className="text-2xl md:text-4xl font-light tracking-wider italic">
  Família
</h1>

// Títulos de seção  
<h2 className="text-lg font-medium text-white">
  Configurações
</h2>

// Labels
<label className="text-sm font-medium text-gray-700">
  Nome da Empresa
</label>

// Corpo de texto
<p className="text-base text-gray-600">
  Descrição do componente
</p>

// Texto pequeno
<span className="text-xs text-gray-500">
  Informação adicional
</span>
```

## 🧩 Componentes Base

### Button Component
```typescript
// Variantes disponíveis
<Button variant="default">Principal</Button>
<Button variant="outline">Secundário</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="destructive">Destructivo</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="lg">Grande</Button>
```

### Card Component
```typescript
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição do conteúdo</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo principal */}
  </CardContent>
</Card>
```

### Input Components
```typescript
// Input básico
<Input 
  placeholder="Digite aqui..." 
  className="w-full"
/>

// Select
<Select onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opção 1</SelectItem>
  </SelectContent>
</Select>

// Switch
<Switch 
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
/>
```

## 📐 Sistema de Espaçamentos

### Scale de Spacing
```css
/* Tailwind spacing scale usado */
space-1: 0.25rem;  /* 4px */
space-2: 0.5rem;   /* 8px */
space-3: 0.75rem;  /* 12px */
space-4: 1rem;     /* 16px */
space-6: 1.5rem;   /* 24px */
space-8: 2rem;     /* 32px */
space-12: 3rem;    /* 48px */
```

### Padrões de Layout
```typescript
// Container padrão
<div className="p-4 md:p-6">

// Espaçamento entre elementos
<div className="space-y-4">  /* Vertical */
<div className="space-x-3">  /* Horizontal */

// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

## 📱 Responsividade

### Breakpoints
```css
/* Mobile First - padrão sem prefixo */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
```

### Padrões Responsivos
```typescript
// Layout Grid Mobile → Desktop
<div className={cn(
  "grid grid-cols-4 gap-3",          // Mobile: 4 colunas
  "md:grid-cols-6 md:gap-4"         // Desktop: 6 colunas
)}>

// Texto responsivo
<h1 className="text-2xl md:text-4xl">

// Padding responsivo
<div className="p-4 md:p-6 lg:p-8">
```

## ✨ Animações (Framer Motion)

### Padrões de Animação
```typescript
// Fade In
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// Slide In
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>

// Scale Hover
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

### Staggered Animations
```typescript
// Para listas de elementos
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
>
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    />
  ))}
</motion.div>
```

## 🔲 Ícones (Lucide React)

### Padrões de Uso
```typescript
import { Settings, Users, Calendar } from 'lucide-react';

// Tamanhos padrão
<Settings className="w-4 h-4" />   /* Pequeno */
<Settings className="w-5 h-5" />   /* Médio */
<Settings className="w-6 h-6" />   /* Grande */

// Com cores
<Settings className="w-5 h-5 text-gray-600" />
<Settings className="w-5 h-5 text-white" />
```

### Ícones Comuns no Projeto
- `Settings` - Configurações
- `Users` - Usuários/CRM
- `Calendar` - Agenda
- `ShoppingBag` - App Store
- `Bell` - Notificações
- `Eye` - Visualizar
- `Upload` - Upload de arquivos

## 🎭 Estados Visuais

### Loading States
```typescript
// Skeleton loading
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

// Spinner component
<Loader2 className="w-4 h-4 animate-spin" />
```

### Empty States
```typescript
<div className="text-center py-8">
  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
    <Icon className="w-8 h-8 text-gray-400" />
  </div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    Nenhum item encontrado
  </h3>
  <p className="text-gray-500 mb-4">
    Comece criando seu primeiro item
  </p>
  <Button>Criar Item</Button>
</div>
```

## 🏷️ Padrões de Layout

### Mobile App Grid (4x4)
```typescript
<div className="grid grid-cols-4 gap-3 justify-items-center">
  {apps.map(app => (
    <div className="flex flex-col items-center space-y-1.5">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700">
        {app.icon}
      </div>
      <span className="text-white text-xs">{app.label}</span>
    </div>
  ))}
</div>
```

### Desktop Sidebar
```typescript
<div className="space-y-2">
  {items.map(item => (
    <button className="w-full hover:bg-white/20 text-white h-auto p-3 justify-start gap-3 flex items-center rounded-lg">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        {item.icon}
      </div>
      <span className="text-sm">{item.label}</span>
    </button>
  ))}
</div>
```

## ✅ Checklist de Componentes

Ao criar novos componentes, certifique-se de:

- [ ] **Responsivo** - Funciona em mobile e desktop
- [ ] **Acessível** - ARIA labels quando necessário
- [ ] **Consistente** - Usa tokens do design system
- [ ] **Performante** - Otimizado para re-renders
- [ ] **Testável** - Props e estados bem definidos
- [ ] **Documentado** - Props interface clara

---

## 📚 Recursos

- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Tailwind CSS Classes](https://tailwindcss.com/docs)
- [Framer Motion API](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/icons/)
- [Componentes Implementados](./components-structure.md)