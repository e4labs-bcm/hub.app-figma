import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Palette, 
  Shield, 
  Bell, 
  User,
  Upload,
  Eye,
  RotateCcw,
  Save,
  LogOut,
  Building
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BackgroundSettings } from './settings/BackgroundSettings';
import { LogoSettings } from './settings/LogoSettings';
import { BannerSettings } from './settings/BannerSettings';
import { AccessControlSettings } from './settings/AccessControlSettings';
import { PushNotificationSettings } from './settings/PushNotificationSettings';
import { UserProfileSettings } from './settings/UserProfileSettings';
import { CompanySettings } from './settings/CompanySettings';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function SettingsPage({ isOpen, onClose, isMobile = true }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('company');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { resetToDefaults } = useSettings();
  const { logout } = useAuth();

  const tabs = [
    {
      id: 'company',
      label: 'Empresa',
      icon: <Building className="w-4 h-4" />,
      description: 'Gerencie as informações da sua empresa'
    },
    {
      id: 'appearance',
      label: 'Aparência',
      icon: <Palette className="w-4 h-4" />,
      description: 'Personalize a aparência da sua aplicação'
    },
    {
      id: 'access',
      label: 'Controle de Acesso',
      icon: <Shield className="w-4 h-4" />,
      description: 'Configure módulos e permissões'
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: <Bell className="w-4 h-4" />,
      description: 'Configure alertas e lembretes'
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: <User className="w-4 h-4" />,
      description: 'Gerencie suas informações pessoais'
    }
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleResetDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar todas as configurações padrão? Esta ação não pode ser desfeita.')) {
      resetToDefaults();
      setHasUnsavedChanges(false);
    }
  };

  if (!isOpen) return null;

  const containerClasses = isMobile 
    ? "fixed inset-0 z-50 bg-background"
    : "fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none";

  const contentClasses = isMobile
    ? "w-full h-full"
    : "w-full max-w-6xl h-[90vh] bg-background rounded-3xl shadow-2xl border pointer-events-auto";

  return (
    <>
      {/* Desktop Backdrop - rendered separately */}
      <AnimatePresence>
        {!isMobile && (
          <motion.div
            key="settings-backdrop"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Settings Content */}
      <AnimatePresence>
        <motion.div
          key="settings-container"
          className={containerClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Content */}
          <motion.div
            key="settings-content"
            className={contentClasses}
            initial={isMobile ? { x: "100%" } : { scale: 0.9, opacity: 0 }}
            animate={isMobile ? { x: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { x: "100%" } : { scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-medium text-foreground">Configurações</h1>
                    <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDefaults}
                  className="hidden sm:flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Padrão
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {isMobile ? '' : 'Sair'}
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                {/* Tabs Navigation */}
                <div className="border-b border-border flex-shrink-0">
                  <TabsList className="w-full justify-start h-auto p-1 bg-transparent">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-3 rounded-lg transition-all"
                      >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Tabs Content */}
                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto">
                    <div className="p-6 space-y-6">
                      {/* Tab Description */}
                      <div className="mb-6">
                        <p className="text-muted-foreground">
                          {tabs.find(tab => tab.id === activeTab)?.description}
                        </p>
                      </div>

                      <TabsContent value="company" className="mt-0">
                        <CompanySettings />
                      </TabsContent>

                      <TabsContent value="appearance" className="mt-0 space-y-6">
                        <BackgroundSettings />
                        <LogoSettings />
                        <BannerSettings />
                      </TabsContent>

                      <TabsContent value="access" className="mt-0">
                        <AccessControlSettings />
                      </TabsContent>

                      <TabsContent value="notifications" className="mt-0">
                        <PushNotificationSettings />
                      </TabsContent>

                      <TabsContent value="profile" className="mt-0">
                        <UserProfileSettings onLogout={handleLogout} />
                      </TabsContent>
                    </div>
                  </div>
                </div>
              </Tabs>
            </div>

            {/* Mobile Action Buttons */}
            {isMobile && (
              <div className="p-4 border-t border-border flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetDefaults}
                  className="flex-1 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Padrão
                </Button>
              </div>
            )}
          </div>
        </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}