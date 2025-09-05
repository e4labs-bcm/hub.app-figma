import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Globe
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CompanyData {
  nome_empresa: string;
  cnpj: string;
  email_empresa: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  website?: string;
  descricao?: string;
}

export function CompanySettings() {
  const { tenant, user } = useAuth();
  const { handleError, handleSuccess, logAction } = useErrorHandler();
  
  const [formData, setFormData] = useState<CompanyData>({
    nome_empresa: '',
    cnpj: '',
    email_empresa: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    website: '',
    descricao: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<CompanyData | null>(null);

  // Carregar dados da empresa
  useEffect(() => {
    if (tenant) {
      const data: CompanyData = {
        nome_empresa: tenant.nome_empresa || '',
        cnpj: tenant.cnpj || '',
        email_empresa: tenant.email_empresa || '',
        telefone: tenant.telefone || '',
        endereco: tenant.endereco || '',
        cidade: tenant.cidade || '',
        estado: tenant.estado || '',
        cep: tenant.cep || '',
        website: tenant.website || '',
        descricao: tenant.descricao || ''
      };
      
      setFormData(data);
      setOriginalData(data);
    }
  }, [tenant]);

  // Verificar se há alterações
  useEffect(() => {
    if (originalData) {
      const changed = Object.keys(formData).some(
        key => formData[key as keyof CompanyData] !== originalData[key as keyof CompanyData]
      );
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.nome_empresa.trim()) {
      errors.nome_empresa = 'Nome da empresa é obrigatório';
    }

    if (!formData.email_empresa.trim()) {
      errors.email_empresa = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_empresa)) {
      errors.email_empresa = 'Email inválido';
    }

    if (formData.cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      // Validação básica de formato CNPJ
      const cnpjNumbers = formData.cnpj.replace(/\D/g, '');
      if (cnpjNumbers.length !== 14) {
        errors.cnpj = 'CNPJ deve ter 14 dígitos';
      }
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'Website deve começar com http:// ou https://';
    }

    return errors;
  };

  const handleSave = async () => {
    if (!tenant) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      handleError(new Error(firstError), 'company-settings-validation');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('Salvando configurações da empresa...');

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/company/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenant_id: tenant.id,
          ...formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar configurações');
      }

      const result = await response.json();
      console.log('Configurações salvas com sucesso:', result);

      // Atualizar dados originais
      setOriginalData(formData);
      setHasChanges(false);

      handleSuccess(
        'Configurações da empresa salvas com sucesso!',
        'UPDATE_COMPANY',
        'tenant',
        {
          tenant_id: tenant.id,
          changes: formData,
          user_id: user?.id
        }
      );

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      handleError(error, 'company-settings-save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setHasChanges(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Building className="w-5 h-5" />
          Configurações da Empresa
        </h3>
        <p className="text-sm text-muted-foreground">
          Gerencie as informações básicas da sua empresa
        </p>
      </div>

      <Separator />

      {/* Status Badge */}
      {tenant && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Empresa Ativa
          </Badge>
          <span className="text-sm text-muted-foreground">
            Criada em {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )}

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Dados principais da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
              <Input
                id="nome_empresa"
                value={formData.nome_empresa}
                onChange={(e) => handleInputChange('nome_empresa', e.target.value)}
                placeholder="Digite o nome da empresa"
                required
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => {
                  const formatted = formatCNPJ(e.target.value);
                  if (formatted.replace(/\D/g, '').length <= 14) {
                    handleInputChange('cnpj', formatted);
                  }
                }}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>

            <div>
              <Label htmlFor="email_empresa">Email da Empresa *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email_empresa"
                  type="email"
                  value={formData.email_empresa}
                  onChange={(e) => handleInputChange('email_empresa', e.target.value)}
                  placeholder="contato@empresa.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    handleInputChange('telefone', formatted);
                  }}
                  placeholder="(11) 99999-9999"
                  className="pl-10"
                  maxLength={15}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.empresa.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição da Empresa</Label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva brevemente a atividade da empresa..."
              className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              maxLength={500}
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {formData.descricao?.length || 0}/500
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
          <CardDescription>
            Informações de localização da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  placeholder="Rua, número, bairro"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                placeholder="São Paulo"
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                placeholder="SP"
                maxLength={2}
              />
            </div>

            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, '');
                  const formatted = numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2');
                  if (numbers.length <= 8) {
                    handleInputChange('cep', formatted);
                  }
                }}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {hasChanges && (
            <>
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span>Você tem alterações não salvas</span>
            </>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
          >
            Descartar Alterações
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Nota sobre campos obrigatórios */}
      <div className="text-xs text-muted-foreground">
        * Campos obrigatórios
      </div>
    </div>
  );
}