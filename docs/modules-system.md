# 🧩 Sistema de Módulos - Hub.App

O Hub.App é construído em torno de um **sistema modular dinâmico** que permite adicionar e remover funcionalidades conforme necessário.

## 🎯 Conceitos Fundamentais

### O que são Módulos?
Módulos são **funcionalidades independentes** que podem ser:
- Ativadas/desativadas por usuário
- Carregadas dinamicamente na interface
- Controladas por permissões granulares
- Monetizadas individualmente (futuro)

### Tipos de Módulos
- **Core Modules**: Essenciais (Auth, Settings)
- **Free Modules**: Gratuitos para todos (CRM básico, Agenda)
- **Premium Modules**: Pagos (CRM avançado, Relatórios)
- **Custom Modules**: Desenvolvidos sob demanda

## 🗄️ Estrutura de Dados

### Tabela de Módulos
```sql
CREATE TABLE modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT, -- 'core', 'productivity', 'finance', etc
  icone_lucide TEXT, -- Nome do ícone Lucide
  cor_gradiente TEXT, -- Classes CSS para gradiente
  link_destino TEXT, -- URL externa ou rota interna
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela de Módulos por Usuário
```sql  
CREATE TABLE user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES perfis(id),
  modulo_id UUID REFERENCES modulos(id),
  tenant_id UUID REFERENCES tenants(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, modulo_id)
);
```

## ⚛️ Hook useModules

### Implementação
```typescript
export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserModules();
    }
  }, [user]);

  const loadUserModules = async () => {
    try {
      // RLS filtra automaticamente por tenant_id
      const { data, error } = await supabase
        .from('user_modules')
        .select(`
          id,
          is_active,
          modulos (
            id,
            nome,
            descricao,
            categoria,
            icone_lucide,
            cor_gradiente,
            link_destino,
            is_premium
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      setModules(data?.map(um => um.modulos) || []);
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { modules, isLoading, loadUserModules };
}
```

### Uso no Componente
```typescript
function AnimatedAppGrid() {
  const { modules, isLoading } = useModules();
  const { hasPermission } = usePermissions();

  // Filtrar módulos por permissão
  const availableModules = modules.filter(module => {
    const permission = `${module.nome.toLowerCase()}.read`;
    return hasPermission(permission);
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {availableModules.map(module => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}
```

## 🎨 Component ModuleCard

### Renderização Dinâmica
```typescript
interface ModuleCardProps {
  module: Module;
  onClick?: () => void;
}

export function ModuleCard({ module, onClick }: ModuleCardProps) {
  // Obter componente de ícone dinamicamente
  const IconComponent = getIconComponent(module.icone_lucide);
  
  const handleClick = () => {
    if (module.link_destino) {
      // Link externo
      if (module.link_destino.startsWith('http')) {
        window.open(module.link_destino, '_blank');
      } else {
        // Rota interna (futuro)
        navigate(module.link_destino);
      }
    }
    onClick?.();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="flex flex-col items-center space-y-2"
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
        module.cor_gradiente || "bg-gradient-to-br from-gray-500 to-gray-700"
      )}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
      <span className="text-white text-xs text-center">
        {module.nome}
      </span>
      {module.is_premium && (
        <Badge variant="secondary" className="text-xs">
          Premium
        </Badge>
      )}
    </motion.button>
  );
}
```

### Função Helper para Ícones
```typescript
function getIconComponent(iconeName: string) {
  const icons = {
    // Core
    Users, Settings, ShoppingBag, Bell,
    // Productivity  
    Calendar, Book, MessageCircle,
    // Finance
    DollarSign, Package, ShoppingCart,
    // Social
    Instagram, Youtube, Headphones,
    // Default
    Package: Package
  };
  
  return icons[iconeName as keyof typeof icons] || Package;
}
```

## 🎨 Categorização de Módulos

### Cores por Categoria
```typescript
const getCategoryColor = (category: string) => {
  const colors = {
    core: "bg-gradient-to-br from-gray-600 to-gray-800",
    productivity: "bg-gradient-to-br from-blue-500 to-blue-700",
    finance: "bg-gradient-to-br from-green-500 to-green-700",
    ecommerce: "bg-gradient-to-br from-purple-500 to-purple-700",
    hr: "bg-gradient-to-br from-orange-500 to-orange-700",
    crm: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    social: "bg-gradient-to-br from-pink-500 to-pink-700",
    default: "bg-gradient-to-br from-gray-500 to-gray-700"
  };
  
  return colors[category as keyof typeof colors] || colors.default;
};
```

### Organização no App Store
```typescript
function AppStore() {
  const { modules } = useModules();
  
  // Agrupar por categoria
  const modulesByCategory = modules.reduce((acc, module) => {
    const category = module.categoria || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="space-y-6">
      {Object.entries(modulesByCategory).map(([category, modules]) => (
        <div key={category}>
          <h3 className="font-semibold mb-3 capitalize">{category}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {modules.map(module => (
              <ModuleStoreCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 🔐 Sistema de Permissões

### Controle de Acesso
```typescript
// Convenção de permissões: {module}.{action}
const permissions = [
  'crm.read',      // Ver módulo CRM
  'crm.write',     // Editar no CRM
  'agenda.read',   // Ver agenda
  'agenda.write',  // Criar eventos
  'settings.read', // Acessar configurações
  'appstore.read'  // Ver App Store
];
```

### Verificação no Frontend
```typescript
function ModuleIcon({ module }: { module: Module }) {
  const { hasPermission } = usePermissions();
  const canAccess = hasPermission(`${module.nome.toLowerCase()}.read`);
  
  if (!canAccess) {
    return null; // Ou componente de acesso negado
  }
  
  return <ModuleCard module={module} />;
}
```

## 🛒 App Store Interna

### Interface de Instalação
```typescript
function ModuleStoreCard({ module }: { module: Module }) {
  const [isInstalling, setIsInstalling] = useState(false);
  const { user } = useAuth();

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await supabase.from('user_modules').insert({
        user_id: user.id,
        modulo_id: module.id,
        tenant_id: user.tenant_id
      });
      
      // Refresh módulos
      window.location.reload();
    } catch (error) {
      console.error('Erro ao instalar módulo:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            getCategoryColor(module.categoria)
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-medium">{module.nome}</h4>
            {module.is_premium && (
              <Badge variant="outline">Premium</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {module.descricao}
        </p>
        <Button 
          onClick={handleInstall} 
          disabled={isInstalling}
          className="w-full"
        >
          {isInstalling ? 'Instalando...' : 'Instalar'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 🔧 Gestão de Módulos (Super Admin)

### Interface de Administração
```typescript
function ModuleManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const { hasPermission } = usePermissions();
  
  // Só Super Admin pode acessar
  if (!hasPermission('admin.modules.manage')) {
    return <AccessDenied />;
  }

  const createModule = async (data: CreateModuleData) => {
    await supabase.from('modulos').insert(data);
    loadModules(); // Refresh
  };

  return (
    <div>
      <h1>Gestão de Módulos</h1>
      <CreateModuleForm onSubmit={createModule} />
      <ModulesTable modules={modules} />
    </div>
  );
}
```

## 🚀 Carregamento Dinâmico (Futuro)

### Lazy Loading de Componentes
```typescript
// Carregamento dinâmico de módulos
const ModuleComponents = {
  CRM: lazy(() => import('./modules/CRM')),
  Agenda: lazy(() => import('./modules/Agenda')),
  Financeiro: lazy(() => import('./modules/Financeiro'))
};

function ModuleRenderer({ moduleName }: { moduleName: string }) {
  const Component = ModuleComponents[moduleName as keyof typeof ModuleComponents];
  
  if (!Component) {
    return <div>Módulo não encontrado</div>;
  }
  
  return (
    <Suspense fallback={<ModuleLoader />}>
      <Component />
    </Suspense>
  );
}
```

## 📊 Métricas de Módulos

### Analytics de Uso
```sql
-- Módulos mais instalados
SELECT 
  m.nome,
  COUNT(um.id) as installations
FROM modulos m
LEFT JOIN user_modules um ON m.id = um.modulo_id
GROUP BY m.id, m.nome
ORDER BY installations DESC;

-- Uso por categoria
SELECT 
  m.categoria,
  COUNT(um.id) as usage_count
FROM modulos m
JOIN user_modules um ON m.id = um.modulo_id
GROUP BY m.categoria;
```

---

## 📚 Recursos Relacionados

- [Permissions System](./permissions.md)
- [App Store Internal](./app-store.md)
- [Components Structure](./components-structure.md)
- [Multi-tenancy](./multi-tenancy.md)