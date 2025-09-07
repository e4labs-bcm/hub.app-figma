import { motion, AnimatePresence } from 'framer-motion';
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
  onAppStoreOpen?: () => void;
  onSettingsOpen?: () => void;
  onNotificationsOpen?: () => void;
}

export function ResponsiveLayout({ children, showSidebar = true, onToggleSidebar, onAppStoreOpen, onSettingsOpen, onNotificationsOpen }: ResponsiveLayoutProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence>
        {/* Mobile Layout */}
        <motion.div 
          key="mobile"
          className="md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>

        {/* Desktop Layout */}
        <motion.div 
          key="desktop"
          className="hidden md:flex h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SidebarProvider>
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  key="sidebar"
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <AppSidebar onToggle={onToggleSidebar} onAppStoreOpen={onAppStoreOpen} onSettingsOpen={onSettingsOpen} onNotificationsOpen={onNotificationsOpen} />
                </motion.div>
              )}
            </AnimatePresence>
            
            <SidebarInset className="flex-1">
              <motion.div
                layout
                className="h-full"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </SidebarInset>
          </SidebarProvider>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}