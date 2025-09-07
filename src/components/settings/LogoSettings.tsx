import { useState, useRef } from 'react';
import { Type, Upload, Image as ImageIcon, Eye, Trash2, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useSettings } from '../../hooks/useSettings';
import backgroundImage from '../../assets/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png';

export function LogoSettings() {
  const { logo, updateLogo } = useSettings();
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Check file size before processing (smaller limit for logos)
    const maxSizeInMB = 1; // 1MB limit for logos
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (file.size > maxSizeInBytes) {
      alert(`A imagem é muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). Por favor, escolha uma imagem menor que ${maxSizeInMB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        // Check the resulting base64 size
        const sizeInBytes = new Blob([imageUrl]).size;
        const maxStorageSize = 1 * 1024 * 1024; // 1MB for base64
        
        if (sizeInBytes > maxStorageSize) {
          alert('A imagem processada é muito grande para ser salva permanentemente. Ela será aplicada temporariamente, mas não será mantida após recarregar a página.');
        }
        
        updateLogo({ 
          type: 'image', 
          imageUrl: imageUrl 
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
      setUploading(false);
    }
  };

  const handleTextChange = (text: string) => {
    updateLogo({ text });
  };

  const handleTypeChange = (type: 'text' | 'image') => {
    updateLogo({ type });
  };

  const renderLogoPreview = (size: 'small' | 'large' = 'small') => {
    const baseClasses = size === 'large' 
      ? "text-4xl font-light tracking-wider italic text-white"
      : "text-xl font-light tracking-wider italic text-gray-900";
    
    const shadowClasses = logo.showShadow ? 'drop-shadow-lg' : '';

    if (logo.type === 'image' && logo.imageUrl) {
      const maxWidth = `${logo.size.width}rem`;
      const maxHeight = `${logo.size.height}rem`;
      
      return (
        <img 
          src={logo.imageUrl} 
          alt="Logo" 
          className={`object-contain ${logo.showShadow ? 'drop-shadow-lg' : ''}`}
          style={{ 
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            width: 'auto',
            height: 'auto'
          }}
        />
      );
    }

    return (
      <span className={`${baseClasses} ${shadowClasses}`}>
        {logo.text}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-5 h-5" />
          Logo e Título
        </CardTitle>
        <CardDescription>
          Configure o logo ou texto que aparece no topo da tela inicial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="space-y-3">
          <Label>Preview</Label>
          <div className="w-full h-24 rounded-lg border border-border bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {renderLogoPreview('large')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Ocultar Preview' : 'Preview em Contexto'}
          </Button>
        </div>

        {/* Logo Type Selection */}
        <div className="space-y-4">
          <Label>Tipo de Logo</Label>
          <RadioGroup 
            value={logo.type} 
            onValueChange={handleTypeChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 border border-border rounded-lg p-4">
              <RadioGroupItem value="text" id="text" />
              <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer">
                <Type className="w-4 h-4" />
                Texto
              </Label>
            </div>
            <div className="flex items-center space-x-2 border border-border rounded-lg p-4">
              <RadioGroupItem value="image" id="image" />
              <Label htmlFor="image" className="flex items-center gap-2 cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                Imagem (PNG transparente)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Text Configuration */}
        {logo.type === 'text' && (
          <div className="space-y-3">
            <Label htmlFor="logoText">Texto do Logo</Label>
            <Input
              id="logoText"
              value={logo.text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Digite o texto do logo"
              maxLength={20}
            />
            <p className="text-sm text-muted-foreground">
              Máximo 20 caracteres. Sugestão: nome da família ou marca.
            </p>
          </div>
        )}

        {/* Image Upload */}
        {logo.type === 'image' && (
          <div className="space-y-4">
            <div>
              <Label>Upload da Imagem</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Imagens customizadas são temporárias devido às limitações do navegador.
              </p>
            </div>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Enviando...' : 'Escolher PNG (Temporário)'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Para melhores resultados, use um arquivo PNG com fundo transparente.
                Tamanho recomendado: máximo 200x60px e 1MB.
              </p>
            </div>

            {/* Size Controls - only show if image is loaded */}
            {logo.imageUrl && (
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-3">
                  <Maximize2 className="w-4 h-4" />
                  <Label>Dimensões da Imagem</Label>
                </div>
                
                {/* Width Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Largura Máxima</Label>
                    <span className="text-sm text-muted-foreground">{logo.size.width}rem (~{Math.round(logo.size.width * 16)}px)</span>
                  </div>
                  <Slider
                    value={[logo.size.width]}
                    onValueChange={(value) => updateLogo({ 
                      size: { ...logo.size, width: value[0] } 
                    })}
                    max={25}
                    min={2}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Height Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Altura Máxima</Label>
                    <span className="text-sm text-muted-foreground">{logo.size.height}rem (~{Math.round(logo.size.height * 16)}px)</span>
                  </div>
                  <Slider
                    value={[logo.size.height]}
                    onValueChange={(value) => updateLogo({ 
                      size: { ...logo.size, height: value[0] } 
                    })}
                    max={15}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  A imagem mantém sua proporção original dentro dos limites definidos.
                </p>
              </div>
            )}

            {/* Remove Image */}
            {logo.imageUrl && (
              <Button
                variant="outline"
                onClick={() => updateLogo({ type: 'text', imageUrl: undefined })}
                className="w-full flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remover Imagem e Usar Texto
              </Button>
            )}
          </div>
        )}

        {/* Shadow Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="logoShadow">Sombra Atrás do Logo</Label>
            <Switch
              id="logoShadow"
              checked={logo.showShadow}
              onCheckedChange={(checked) => updateLogo({ showShadow: checked })}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Adiciona uma sombra para melhor legibilidade sobre o fundo.
          </p>
        </div>

        {/* Reset */}
        <Button
          variant="outline"
          onClick={() => updateLogo({
            type: 'text',
            text: 'Família',
            showShadow: true,
            imageUrl: undefined,
            size: {
              width: 12,
              height: 3
            }
          })}
          className="w-full flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Restaurar Configuração Padrão
        </Button>
      </CardContent>

      {/* Context Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-96 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
            {/* Simulated mobile screen */}
            <div className="w-full h-full bg-cover bg-center relative" 
                 style={{ backgroundImage: `url(${backgroundImage})` }}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-center pt-16 pb-8">
                  {renderLogoPreview('large')}
                </div>
                <div className="flex-1 px-8 grid grid-cols-4 gap-4">
                  {/* Simulated app icons */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-white/20 backdrop-blur-sm rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setPreviewMode(false)}
              className="absolute top-4 right-4"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}