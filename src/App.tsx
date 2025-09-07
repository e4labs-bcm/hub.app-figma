import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { PanelLeft } from "lucide-react";
import backgroundImage from "./assets/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png";
import { AnimatedAppGrid } from "./components/AnimatedAppGrid";
import { EventBanner } from "./components/EventBanner";
import { ResponsiveLayout } from "./components/ResponsiveLayout";
import { DesktopHome } from "./components/DesktopHome";
import { LoginPage } from "./components/LoginPage";
import { LoadingScreen } from "./components/LoadingScreen";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { CompanySetupPage } from "./components/CompanySetupPage";
import { AppStore } from "./components/AppStore";
import { SettingsPage } from "./components/SettingsPage";
import { NotificationCenter } from "./components/NotificationCenter";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import {
  SettingsProvider,
  useSettings,
} from "./hooks/useSettings";
import { useAppStore } from "./hooks/useAppStore";
import { ModulesProvider } from "./hooks/useModules";
import { PermissionsProvider } from "./hooks/usePermissions";
import { NotificationsProvider } from "./hooks/useNotifications";

function AppContent() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Safe hook usage with error boundaries
  const auth = useAuth();
  const appStore = useAppStore();
  const settings = useSettings();

  const {
    isAuthenticated,
    isLoading,
    needsCompany,
    user,
    createCompany,
    isSettingsOpen,
    openSettings,
    closeSettings,
  } = auth;
  const { isAppStoreOpen, openAppStore, closeAppStore } =
    appStore;
  const { background, logo, banner } = settings;

  // Detect mobile/desktop
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () =>
      window.removeEventListener("resize", checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show company setup if user needs to create company
  if (needsCompany) {
    return (
      <CompanySetupPage 
        onCreateCompany={createCompany}
        isLoading={isLoading}
      />
    );
  }

  return (
    <>
      <WelcomeMessage />
      <ResponsiveLayout
        showSidebar={showSidebar}
        onToggleSidebar={toggleSidebar}
        onAppStoreOpen={openAppStore}
        onSettingsOpen={openSettings}
        onNotificationsOpen={() => setIsNotificationCenterOpen(true)}
      >
        {/* Mobile Layout Content */}
        <motion.div
          key="mobile-layout"
          className="md:hidden relative w-full h-screen overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Image */}
          <motion.div
            key="mobile-background"
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url(${background.image})`,
              backgroundPosition: background.position,
              backgroundSize: background.size,
              opacity: background.opacity,
            }}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: background.opacity }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Overlay to ensure text readability */}
          <motion.div
            key="mobile-overlay"
            className="absolute inset-0 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full my-[-74px] mx-[17px] py-[-11px] py-[12px] mt-[-61px] mr-[17px] mb-[-70px] ml-[17px] px-[0px] py-[63px]">
            {/* Header with Logo */}
            <motion.div
              key="mobile-header"
              className="flex justify-center pt-12 pb-0"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {logo.type === "image" && logo.imageUrl ? (
                <motion.img
                  src={logo.imageUrl}
                  alt="Logo"
                  className={`object-contain ${logo.showShadow ? "drop-shadow-lg" : ""}`}
                  style={{
                    maxWidth: `${logo.size.width}rem`,
                    maxHeight: `${logo.size.height}rem`,
                    width: "auto",
                    height: "auto",
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.h1
                  className={`text-white text-4xl font-light tracking-wider italic ${logo.showShadow ? "drop-shadow-lg" : ""}`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {logo.text}
                </motion.h1>
              )}
            </motion.div>

            {/* App Grid */}
            <motion.div
              key="mobile-grid"
              className="flex-1 flex items-start justify-center px-6 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="w-full max-w-xs py-[-42px] mx-[0px] py-[4px] mt-[6px] mr-[0px] mb-[1px] ml-[0px] px-[0px] py-[34px]">
                <AnimatedAppGrid
                  onAppStoreOpen={openAppStore}
                  onSettingsOpen={openSettings}
                />
              </div>
            </motion.div>

            {/* Event Banner */}
            {banner.enabled && (
              <motion.div
                key="mobile-banner"
                className="p-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <EventBanner />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Desktop Layout Content */}
        <motion.div
          key="desktop-layout"
          className="hidden md:block relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Show Sidebar Button - only visible when sidebar is hidden */}
          <AnimatePresence>
            {!showSidebar && (
              <motion.button
                key="sidebar-toggle"
                onClick={toggleSidebar}
                className="absolute top-4 left-4 z-50 bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                title="Mostrar menu lateral"
              >
                <PanelLeft className="w-5 h-5" />

                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  Mostrar menu
                </div>
              </motion.button>
            )}
          </AnimatePresence>

          <DesktopHome
            isAppStoreOpen={isAppStoreOpen}
            onAppStoreClose={closeAppStore}
          />
        </motion.div>

        {/* App Store Overlay - Mobile only */}
        <div className="md:hidden">
          <AppStore
            isOpen={isAppStoreOpen}
            onClose={closeAppStore}
            isMobile={true}
          />
        </div>

        {/* Settings Page */}
        <SettingsPage
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          isMobile={isMobile}
        />

        {/* Notification Center */}
        <NotificationCenter
          isOpen={isNotificationCenterOpen}
          onClose={() => setIsNotificationCenterOpen(false)}
          isMobile={isMobile}
        />
      </ResponsiveLayout>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <ModulesProvider>
          <NotificationsProvider>
            <SettingsProvider>
              <AppContent />
            </SettingsProvider>
          </NotificationsProvider>
        </ModulesProvider>
      </PermissionsProvider>
    </AuthProvider>
  );
}