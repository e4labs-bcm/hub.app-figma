import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  lida: boolean;
  lida_em?: string;
  created_at: string;
  user_id: string;
  tenant_id?: string;
  metadata?: any;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'user_id' | 'tenant_id'>) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, tenant } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar notificações do usuário
  const loadNotifications = async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setError(null);
      console.log('Carregando notificações do usuário:', user.id);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/notifications`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar notificações: ${response.status}`);
      }

      const { notifications: userNotifications } = await response.json();
      console.log('Notificações carregadas:', userNotifications?.length || 0);
      
      const notificationsList = userNotifications || [];
      setNotifications(notificationsList);
      
      // Contar não lidas
      const unread = notificationsList.filter((n: Notification) => !n.lida).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setError('Erro ao carregar notificações');
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Marcar como lida
  const markAsRead = async (notificationId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      setError(null);
      console.log('Marcando notificação como lida:', notificationId);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notification_id: notificationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao marcar notificação como lida');
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, lida: true, lida_em: new Date().toISOString() }
            : notification
        )
      );

      // Atualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      setError(error instanceof Error ? error.message : 'Erro ao marcar notificação como lida');
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setError(null);
      console.log('Marcando todas as notificações como lidas');

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao marcar todas as notificações como lidas');
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          lida: true, 
          lida_em: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      setError(error instanceof Error ? error.message : 'Erro ao marcar notificações como lidas');
    }
  };

  // Deletar notificação
  const deleteNotification = async (notificationId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      setError(null);
      console.log('Deletando notificação:', notificationId);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/notifications/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notification_id: notificationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar notificação');
      }

      // Remover do estado local
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Atualizar contador se não era lida
      if (notificationToDelete && !notificationToDelete.lida) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      setError(error instanceof Error ? error.message : 'Erro ao deletar notificação');
    }
  };

  // Criar nova notificação
  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'user_id' | 'tenant_id'>) => {
    if (!isAuthenticated || !user) return;

    try {
      setError(null);
      console.log('Criando nova notificação:', notification.titulo);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/notifications/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: notification.titulo,
          mensagem: notification.mensagem,
          tipo: notification.tipo,
          metadata: notification.metadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar notificação');
      }

      const { notification: newNotification } = await response.json();
      
      // Adicionar ao início da lista
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar notificação');
    }
  };

  // Recarregar notificações
  const refreshNotifications = async () => {
    setIsLoading(true);
    try {
      await loadNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar notificações quando usuário mudar
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    createNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    console.error('useNotifications deve ser usado dentro de NotificationsProvider');
    // Return default values instead of throwing to prevent crashes
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      deleteNotification: async () => {},
      refreshNotifications: async () => {},
      createNotification: async () => {}
    };
  }
  return context;
}