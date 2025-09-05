import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationsSkeleton, EmptyState } from './LoadingStates';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function NotificationCenter({ isOpen, onClose, isMobile = false }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.lida;
    return true;
  });

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  if (!isOpen) return null;

  const containerClasses = isMobile 
    ? "fixed inset-0 z-50 flex items-end"
    : "fixed inset-0 z-50 flex items-center justify-center p-6";

  const contentClasses = isMobile
    ? "w-full h-[80vh] bg-white rounded-t-3xl shadow-2xl"
    : "w-full max-w-md h-[70vh] bg-white rounded-2xl shadow-2xl";

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        <motion.div
          key="notification-backdrop"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      </AnimatePresence>

      {/* Notification Center Content */}
      <AnimatePresence>
        <motion.div
          key="notification-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={containerClasses}
        >
          <motion.div
            key="notification-content"
            className={contentClasses}
            initial={isMobile ? { scale: 0.9, opacity: 0, y: 100 } : { scale: 0.9, opacity: 0 }}
            animate={isMobile ? { scale: 1, opacity: 1, y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { scale: 0.9, opacity: 0, y: 100 } : { scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Notificações</h2>
                    {unreadCount > 0 && (
                      <p className="text-sm text-gray-600">
                        {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Filters and Actions */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                  >
                    Não lidas
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Marcar todas como lidas
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {isLoading ? (
                      <NotificationsSkeleton />
                    ) : filteredNotifications.length === 0 ? (
                      <EmptyState
                        icon={Bell}
                        title={filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
                        description={filter === 'unread' 
                          ? 'Todas as suas notificações foram lidas' 
                          : 'Você não tem notificações no momento'
                        }
                      />
                    ) : (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {filteredNotifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                notification.lida 
                                  ? 'border-gray-100 bg-gray-50/50' 
                                  : 'border-blue-100 bg-blue-50/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.tipo)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className={`text-sm font-medium truncate ${
                                      notification.lida ? 'text-gray-700' : 'text-gray-900'
                                    }`}>
                                      {notification.titulo}
                                    </h4>
                                    
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <span className="text-xs text-gray-500">
                                        {formatRelativeTime(notification.created_at)}
                                      </span>
                                      {!notification.lida && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className={`text-sm mt-1 line-clamp-2 ${
                                    notification.lida ? 'text-gray-600' : 'text-gray-700'
                                  }`}>
                                    {notification.mensagem}
                                  </p>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 mt-3">
                                    {!notification.lida && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                                        className="h-7 px-2 text-xs"
                                      >
                                        <Check className="w-3 h-3 mr-1" />
                                        Marcar como lida
                                      </Button>
                                    )}
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleDelete(notification.id, e)}
                                      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Excluir
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}