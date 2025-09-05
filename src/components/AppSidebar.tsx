import { motion } from 'framer-motion';
import { PanelLeftClose, User, LogOut, Bell } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
} from "./ui/sidebar";
import { AnimatedAppGrid } from './AnimatedAppGrid';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

interface AppSidebarProps {
  onToggle?: () => void;
  onAppStoreOpen?: () => void;
  onSettingsOpen?: () => void;
  onNotificationsOpen?: () => void;
}

export function AppSidebar({ onToggle, onAppStoreOpen, onSettingsOpen, onNotificationsOpen }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar className="border-r-0 bg-white/10 backdrop-blur-sm transition-all duration-500">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="bg-[rgba(0,25,35,1)] bg-[rgba(0,18,46,0.98)] bg-[rgba(0,20,36,1)] flex-1">
          {/* Header with toggle button */}
          <div className="flex items-center justify-between p-4 pb-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SidebarGroupLabel className="text-white/80 text-lg font-medium m-0">
                {user?.familyName || 'Família'}
              </SidebarGroupLabel>
            </motion.div>
            
            {/* Toggle Button */}
            <motion.button
              onClick={onToggle}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              title="Esconder menu lateral"
            >
              <PanelLeftClose className="w-4 h-4" />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Esconder menu
              </div>
            </motion.button>
          </div>
          
          <SidebarGroupContent className="px-4 flex-1 overflow-auto">
            <AnimatedAppGrid isSidebar={true} onAppStoreOpen={onAppStoreOpen} onSettingsOpen={onSettingsOpen} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* User Section Footer */}
      <SidebarFooter className="p-0">
        <div className="bg-[rgba(0,25,35,1)] bg-[rgba(0,18,46,0.98)] bg-[rgba(0,20,36,1)] border-t border-white/10">
          <motion.div 
            className="p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* User Info */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10 border-2 border-white/20">
                <AvatarImage src={user?.avatar_url} alt={user?.nome_completo || user?.nome || 'Usuário'} />
                <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                  {(user?.nome_completo || user?.nome || 'U')?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {user?.nome_completo || user?.nome || 'Usuário'}
                </p>
                <p className="text-white/60 text-xs truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da sessão
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}