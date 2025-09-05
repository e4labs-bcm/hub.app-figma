import { useState, useRef } from 'react';
import { User, Mail, Phone, Users, Upload, Save, LogOut, Trash2, Edit3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner@2.0.3';

interface UserProfileSettingsProps {
  onLogout: () => void;
}

export function UserProfileSettings({ onLogout }: UserProfileSettingsProps) {
  const { userProfile, updateUserProfile } = useSettings();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userProfile);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleCancel = () => {
    setFormData(userProfile);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newFormData = { ...formData, avatar: imageUrl };
        setFormData(newFormData);
        updateUserProfile(newFormData);
        setUploading(false);
        toast.success('Foto de perfil atualizada!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploading(false);
      toast.error('Erro ao enviar foto.');
    }
  };

  const handleRemoveAvatar = () => {
    const newFormData = { ...formData, avatar: undefined };
    setFormData(newFormData);
    updateUserProfile(newFormData);
    toast.success('Foto de perfil removida.');
  };

  const handleLogout = () => {
    logout();
    onLogout();
    toast.success('Logout realizado com sucesso!');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo and Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Foto e Informações Básicas
          </CardTitle>
          <CardDescription>
            Gerencie sua foto de perfil e informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.avatar} alt={formData.name} />
              <AvatarFallback className="text-lg">
                {getInitials(formData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Enviando...' : 'Alterar Foto'}
              </Button>
              {formData.avatar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remover
                </Button>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Informações Pessoais</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Nome Completo</Label>
                <Input
                  id="userName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyName">Nome da Família</Label>
                <Input
                  id="familyName"
                  value={formData.familyName}
                  onChange={(e) => handleInputChange('familyName', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userPhone">Telefone (Opcional)</Label>
                <Input
                  id="userPhone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Detalhes sobre sua conta e configurações de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status da Conta</Label>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Ativa</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Último Acesso</Label>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Membro desde</Label>
              <p className="text-sm text-muted-foreground">
                Janeiro 2024
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <p className="text-sm text-muted-foreground">
                Administrador da Família
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Dados</CardTitle>
          <CardDescription>
            Controle seus dados e configurações de privacidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => {
              // Export user data
              const dataToExport = {
                profile: userProfile,
                exportDate: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
                type: 'application/json'
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `familia-app-dados-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Dados exportados com sucesso!');
            }}
          >
            <Upload className="w-4 h-4" />
            Exportar Meus Dados
          </Button>

          <p className="text-sm text-muted-foreground">
            Baixe uma cópia de todos os seus dados armazenados no aplicativo.
          </p>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Ações da Conta</CardTitle>
          <CardDescription>
            Ações que afetam sua conta e acesso ao aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sair da Sessão</h4>
                <p className="text-sm text-muted-foreground">
                  Encerra sua sessão atual no aplicativo
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-destructive">Excluir Conta</h4>
                <p className="text-sm text-muted-foreground">
                  Remove permanentemente sua conta e todos os dados
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
                    toast.error('Funcionalidade não implementada nesta demonstração.');
                  }
                }}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Conta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}