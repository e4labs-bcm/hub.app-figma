import { Shield, ShoppingBag, Calendar, Menu, Bell, Crown, Star, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useSettings } from '../../hooks/useSettings';

export function AccessControlSettings() {
  const { accessControl, updateAccessControl } = useSettings();

  const modules = [
    {
      id: 'appStore',
      name: 'App Store',
      description: 'Permite acesso à loja de aplicativos',
      icon: <ShoppingBag className="w-4 h-4" />,
      enabled: accessControl.modules.appStore
    },
    {
      id: 'eventBanner',
      name: 'Banner de Eventos',
      description: 'Exibe banner promocional na tela inicial',
      icon: <Calendar className="w-4 h-4" />,
      enabled: accessControl.modules.eventBanner
    },
    {
      id: 'sidebar',
      name: 'Menu Lateral (Desktop)',
      description: 'Mostra menu lateral na versão desktop',
      icon: <Menu className="w-4 h-4" />,
      enabled: accessControl.modules.sidebar
    },
    {
      id: 'notifications',
      name: 'Notificações',
      description: 'Sistema de notificações push',
      icon: <Bell className="w-4 h-4" />,
      enabled: accessControl.modules.notifications
    }
  ];

  const accessLevels = [
    {
      id: 'basic',
      name: 'Básico',
      description: 'Acesso limitado aos recursos essenciais',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-gray-500',
      features: ['Tela inicial', 'Apps básicos']
    },
    {
      id: 'standard',
      name: 'Padrão',
      description: 'Acesso completo aos recursos principais',
      icon: <Star className="w-4 h-4" />,
      color: 'bg-blue-500',
      features: ['Todos os apps', 'Configurações básicas', 'Notificações']
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Acesso total com recursos avançados',
      icon: <Crown className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      features: ['Todos os recursos', 'Configurações avançadas', 'Suporte prioritário']
    }
  ];

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    updateAccessControl({
      modules: {
        ...accessControl.modules,
        [moduleId]: enabled
      }
    });
  };

  const handleLevelChange = (level: 'basic' | 'standard' | 'premium') => {
    updateAccessControl({ level });
    
    // Auto-configure modules based on level
    const moduleSettings = {
      basic: {
        appStore: false,
        eventBanner: true,
        sidebar: false,
        notifications: false
      },
      standard: {
        appStore: true,
        eventBanner: true,
        sidebar: true,
        notifications: true
      },
      premium: {
        appStore: true,
        eventBanner: true,
        sidebar: true,
        notifications: true
      }
    };

    updateAccessControl({
      level,
      modules: moduleSettings[level]
    });
  };

  const currentLevel = accessLevels.find(level => level.id === accessControl.level);

  return (
    <div className="space-y-6">
      {/* Access Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Nível de Acesso
          </CardTitle>
          <CardDescription>
            Define o nível geral de permissões e recursos disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Level Display */}
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/50">
            <div className={`w-10 h-10 rounded-lg ${currentLevel?.color} flex items-center justify-center text-white`}>
              {currentLevel?.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{currentLevel?.name}</span>
                <Badge variant="secondary">Atual</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentLevel?.description}</p>
            </div>
          </div>

          {/* Level Selection */}
          <div className="space-y-3">
            <Label>Alterar Nível de Acesso</Label>
            <Select value={accessControl.level} onValueChange={handleLevelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accessLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    <div className="flex items-center gap-2">
                      {level.icon}
                      <span>{level.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Features included */}
          <div className="space-y-2">
            <Label>Recursos Incluídos:</Label>
            <div className="flex flex-wrap gap-2">
              {currentLevel?.features.map((feature, index) => (
                <Badge key={index} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Control */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Módulos</CardTitle>
          <CardDescription>
            Ative ou desative módulos específicos independentemente do nível de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map((module) => (
            <div key={module.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {module.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{module.name}</span>
                    {module.enabled && <Badge variant="secondary" className="text-xs">Ativo</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
              <Switch
                checked={module.enabled}
                onCheckedChange={(checked) => handleModuleToggle(module.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Access Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Permissões</CardTitle>
          <CardDescription>
            Visualização geral das configurações atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Nível de Acesso:</span>
              <Badge className={currentLevel?.color}>{currentLevel?.name}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Módulos Ativos:</span>
              <span className="font-medium">
                {Object.values(accessControl.modules).filter(Boolean).length} de {Object.values(accessControl.modules).length}
              </span>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                As configurações serão aplicadas imediatamente e afetarão a experiência do usuário na próxima navegação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}