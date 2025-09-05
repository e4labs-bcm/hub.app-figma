import { Bell, Clock, Calendar, Smartphone, TestTube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useSettings } from '../../hooks/useSettings';
import { toast } from 'sonner@2.0.3';

export function PushNotificationSettings() {
  const { pushSettings, updatePushSettings } = useSettings();

  const timeOptions = [
    { value: '07:00', label: '07:00 - Manhã cedo' },
    { value: '08:00', label: '08:00 - Início da manhã' },
    { value: '09:00', label: '09:00 - Meio da manhã' },
    { value: '10:00', label: '10:00 - Final da manhã' },
    { value: '12:00', label: '12:00 - Meio-dia' },
    { value: '18:00', label: '18:00 - Final da tarde' },
    { value: '19:00', label: '19:00 - Início da noite' },
    { value: '20:00', label: '20:00 - Noite' },
    { value: '21:00', label: '21:00 - Final da noite' }
  ];

  const handleTestNotification = () => {
    // Simulate sending a test notification
    toast.success('🔔 Notificação de teste enviada!', {
      description: 'Esta é uma prévia de como as notificações aparecerão.',
      duration: 5000
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Permissões de notificação concedidas!');
        updatePushSettings({ enabled: true });
      } else {
        toast.error('Permissões de notificação negadas.');
        updatePushSettings({ enabled: false });
      }
    } else {
      toast.error('Notificações não são suportadas neste navegador.');
    }
  };

  const notificationStatus = () => {
    if (!('Notification' in window)) {
      return { status: 'not-supported', message: 'Não suportado neste navegador' };
    }
    
    if (Notification.permission === 'granted') {
      return { status: 'granted', message: 'Permissões concedidas' };
    }
    
    if (Notification.permission === 'denied') {
      return { status: 'denied', message: 'Permissões negadas' };
    }
    
    return { status: 'default', message: 'Permissões não solicitadas' };
  };

  const status = notificationStatus();

  return (
    <div className="space-y-6">
      {/* Push Notification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Status das Notificações
          </CardTitle>
          <CardDescription>
            Configure e gerencie as notificações push do aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <div>
                <p className="font-medium">Status das Permissões</p>
                <p className="text-sm text-muted-foreground">{status.message}</p>
              </div>
            </div>
            <Badge 
              variant={status.status === 'granted' ? 'default' : 'secondary'}
              className={status.status === 'granted' ? 'bg-green-100 text-green-800' : ''}
            >
              {status.status === 'granted' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {/* Enable/Request Permissions */}
          {status.status !== 'granted' && (
            <Button 
              onClick={requestNotificationPermission}
              className="w-full flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Solicitar Permissões de Notificação
            </Button>
          )}

          {/* Master Switch */}
          <div className="flex items-center justify-between">
            <Label htmlFor="pushEnabled">Ativar Notificações Push</Label>
            <Switch
              id="pushEnabled"
              checked={pushSettings.enabled && status.status === 'granted'}
              onCheckedChange={(checked) => {
                if (checked && status.status !== 'granted') {
                  requestNotificationPermission();
                } else {
                  updatePushSettings({ enabled: checked });
                }
              }}
              disabled={status.status === 'not-supported'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      {pushSettings.enabled && status.status === 'granted' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Lembretes Diários
              </CardTitle>
              <CardDescription>
                Configure lembretes automáticos para interagir com o app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dailyReminder">Lembrete Diário</Label>
                <Switch
                  id="dailyReminder"
                  checked={pushSettings.dailyReminder}
                  onCheckedChange={(checked) => updatePushSettings({ dailyReminder: checked })}
                />
              </div>

              {pushSettings.dailyReminder && (
                <div className="space-y-3">
                  <Label>Horário do Lembrete</Label>
                  <Select 
                    value={pushSettings.reminderTime} 
                    onValueChange={(time) => updatePushSettings({ reminderTime: time })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Um lembrete amigável será enviado diariamente neste horário.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Notificações de Conteúdo
              </CardTitle>
              <CardDescription>
                Configure notificações sobre novos conteúdos e eventos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyDigest">Resumo Semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo das atividades da semana
                  </p>
                </div>
                <Switch
                  id="weeklyDigest"
                  checked={pushSettings.weeklyDigest}
                  onCheckedChange={(checked) => updatePushSettings({ weeklyDigest: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="eventNotifications">Notificações de Eventos</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas sobre novos eventos e celebrações
                  </p>
                </div>
                <Switch
                  id="eventNotifications"
                  checked={pushSettings.eventNotifications}
                  onCheckedChange={(checked) => updatePushSettings({ eventNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Teste de Notificação
              </CardTitle>
              <CardDescription>
                Envie uma notificação de teste para verificar se está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleTestNotification}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Enviar Notificação de Teste
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                A notificação de teste aparecerá como uma mensagem na tela.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Notification Schedule Summary */}
      {pushSettings.enabled && status.status === 'granted' && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Programação</CardTitle>
            <CardDescription>
              Visão geral das notificações configuradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pushSettings.dailyReminder && (
                <div className="flex justify-between items-center">
                  <span>Lembrete Diário:</span>
                  <Badge variant="outline">{pushSettings.reminderTime}</Badge>
                </div>
              )}
              {pushSettings.weeklyDigest && (
                <div className="flex justify-between items-center">
                  <span>Resumo Semanal:</span>
                  <Badge variant="outline">Domingo às 09:00</Badge>
                </div>
              )}
              {pushSettings.eventNotifications && (
                <div className="flex justify-between items-center">
                  <span>Eventos:</span>
                  <Badge variant="outline">Quando disponível</Badge>
                </div>
              )}
              {!pushSettings.dailyReminder && !pushSettings.weeklyDigest && !pushSettings.eventNotifications && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma notificação programada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}