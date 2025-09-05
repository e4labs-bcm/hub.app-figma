// Hook para carregar aplicativos da família
import { useState, useEffect } from 'react';

interface App {
  id: string;
  name: string;
  description?: string;
  icon: string; // URL da imagem ou emoji
  color: string; // Classe CSS para cor de fundo
  url?: string; // Link externo
  action?: () => void; // Ação personalizada
  category: 'social' | 'utility' | 'entertainment' | 'productivity';
  isActive: boolean;
  order: number;
}

interface UseAppsReturn {
  apps: App[];
  loading: boolean;
  error: string | null;
  refreshApps: () => void;
}

export function useApps(): UseAppsReturn {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/family/apps', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ordenar apps por posição
        const sortedApps = data.sort((a: App, b: App) => a.order - b.order);
        setApps(sortedApps);
      } else {
        throw new Error('Erro ao carregar aplicativos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback com dados mockados em caso de erro
      setApps(getDefaultApps());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const refreshApps = () => {
    fetchApps();
  };

  return { apps, loading, error, refreshApps };
}

// Apps padrão como fallback
function getDefaultApps(): App[] {
  return [
    {
      id: '1',
      name: 'Fotos',
      icon: '📸',
      color: 'bg-blue-500',
      url: '/photos',
      category: 'social',
      isActive: true,
      order: 1
    },
    {
      id: '2',
      name: 'Calendário',
      icon: '📅',
      color: 'bg-red-500',
      url: '/calendar',
      category: 'productivity',
      isActive: true,
      order: 2
    },
    {
      id: '3',
      name: 'Lista de Compras',
      icon: '🛒',
      color: 'bg-green-500',
      url: '/shopping',
      category: 'utility',
      isActive: true,
      order: 3
    },
    {
      id: '4',
      name: 'Receitas',
      icon: '👨‍🍳',
      color: 'bg-orange-500',
      url: '/recipes',
      category: 'utility',
      isActive: true,
      order: 4
    },
    {
      id: '5',
      name: 'Finanças',
      icon: '💰',
      color: 'bg-yellow-500',
      url: '/finances',
      category: 'productivity',
      isActive: true,
      order: 5
    },
    {
      id: '6',
      name: 'Chat Família',
      icon: '💬',
      color: 'bg-purple-500',
      url: '/chat',
      category: 'social',
      isActive: true,
      order: 6
    },
    {
      id: '7',
      name: 'Tarefas',
      icon: '✅',
      color: 'bg-indigo-500',
      url: '/tasks',
      category: 'productivity',
      isActive: true,
      order: 7
    },
    {
      id: '8',
      name: 'Localização',
      icon: '📍',
      color: 'bg-pink-500',
      url: '/location',
      category: 'utility',
      isActive: true,
      order: 8
    },
    {
      id: '9',
      name: 'Música',
      icon: '🎵',
      color: 'bg-teal-500',
      url: '/music',
      category: 'entertainment',
      isActive: true,
      order: 9
    },
    {
      id: '10',
      name: 'Documentos',
      icon: '📄',
      color: 'bg-gray-500',
      url: '/documents',
      category: 'productivity',
      isActive: true,
      order: 10
    },
    {
      id: '11',
      name: 'Emergência',
      icon: '🚨',
      color: 'bg-red-600',
      url: '/emergency',
      category: 'utility',
      isActive: true,
      order: 11
    },
    {
      id: '12',
      name: 'Configurações',
      icon: '⚙️',
      color: 'bg-gray-600',
      url: '/settings',
      category: 'utility',
      isActive: true,
      order: 12
    }
  ];
}

// Hook para apps por categoria
export function useAppsByCategory(category: App['category']) {
  const { apps, loading, error } = useApps();
  
  const filteredApps = apps.filter(app => 
    app.category === category && app.isActive
  );
  
  return { apps: filteredApps, loading, error };
}

// Hook para ações de app
export function useAppActions() {
  const openApp = (app: App) => {
    if (app.action) {
      app.action();
    } else if (app.url) {
      if (app.url.startsWith('http')) {
        window.open(app.url, '_blank');
      } else {
        // Navegação interna (use seu roteador)
        window.location.href = app.url;
      }
    }
  };

  const trackAppUsage = async (appId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/analytics/app-usage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          appId, 
          timestamp: new Date().toISOString() 
        }),
      });
    } catch (error) {
      console.error('Erro ao registrar uso do app:', error);
    }
  };

  return { openApp, trackAppUsage };
}