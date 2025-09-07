import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Eye, Type, ToggleLeft, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useSettings } from '../../hooks/useSettings';
import backgroundImage from '../../assets/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png';

export function BannerSettings() {
  const { banner, updateBanner } = useSettings();
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Check file size before processing
    const maxSizeInMB = 1.5; // 1.5MB limit for banner images
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
        const maxStorageSize = 1.5 * 1024 * 1024; // 1.5MB for base64
        
        if (sizeInBytes > maxStorageSize) {
          alert('A imagem processada é muito grande para ser salva permanentemente. Ela será aplicada temporariamente, mas não será mantida após recarregar a página.');
        }
        
        updateBanner({ imageUrl });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading banner image:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
      setUploading(false);
    }
  };

  const handleUnsplashPreset = (preset: string) => {
    const presets = {
      'rio-sugarloaf': backgroundImage,
      'family-celebration': 'https://images.unsplash.com/photo-1731596153022-4cedafe3330a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBjZWxlYnJhdGlvbiUyMHBhcnR5fGVufDF8fHx8MTc1NjgxNDg1NXww&ixlib=rb-4.1.0&q=80&w=1080',
      'sunset-beach': 'https://images.unsplash.com/photo-1682502922918-fed575428e3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBiZWFjaCUyMHRyb3BpY2FsfGVufDF8fHx8MTc1NjgxNDg1OXww&ixlib=rb-4.1.0&q=80&w=1080',
      'mountain-landscape': 'https://images.unsplash.com/photo-1596693097925-9d818cc9692d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHNjZW5pY3xlbnwxfHx8fDE3NTY2OTg1MzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'city-lights': 'https://images.unsplash.com/photo-1559321987-c98064686fb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbGlnaHRzJTIwbmlnaHQlMjB1cmJhbnxlbnwxfHx8fDE3NTY3NzYwNjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
    };
    updateBanner({ imageUrl: presets[preset as keyof typeof presets] });
  };

  const renderBannerPreview = () => {
    if (!banner.enabled) {
      return (
        <div className="w-full h-24 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
          Banner Desabilitado
        </div>
      );
    }

    return (
      <div className="w-full h-24 rounded-lg overflow-hidden relative bg-gradient-to-r from-orange-400 to-pink-500">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${banner.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-4">
          <h3 className="font-medium text-lg">{banner.title}</h3>
          {banner.subtitle && (
            <p className="text-sm opacity-90">{banner.subtitle}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Banner Promocional
        </CardTitle>
        <CardDescription>
          Configure o banner que aparece na parte inferior da tela inicial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Banner */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="bannerEnabled">Exibir Banner</Label>
            <Switch
              id="bannerEnabled"
              checked={banner.enabled}
              onCheckedChange={(checked) => updateBanner({ enabled: checked })}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Ative ou desative a exibição do banner promocional na tela inicial.
          </p>
        </div>

        {banner.enabled && (
          <>
            {/* Preview */}
            <div className="space-y-3">
              <Label>Preview</Label>
              {renderBannerPreview()}
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

            {/* Banner Text */}
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="bannerTitle">Título Principal</Label>
                <Input
                  id="bannerTitle"
                  value={banner.title}
                  onChange={(e) => updateBanner({ title: e.target.value })}
                  placeholder="Ex: CELEBRAÇÃO"
                  maxLength={30}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="bannerSubtitle">Subtítulo (Opcional)</Label>
                <Input
                  id="bannerSubtitle"
                  value={banner.subtitle}
                  onChange={(e) => updateBanner({ subtitle: e.target.value })}
                  placeholder="Ex: Momentos especiais em família"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Banner Image */}
            <div className="space-y-4">
              <Label>Imagem de Fundo</Label>
              
              {/* Upload custom image */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Imagens personalizadas são temporárias devido às limitações do navegador.
                  </p>
                </div>
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
                  {uploading ? 'Enviando...' : 'Enviar Imagem (Temporário)'}
                </Button>
              </div>

              {/* Preset images */}
              <div className="space-y-3">
                <Label>Ou escolha uma imagem pronta:</Label>
                <Select onValueChange={handleUnsplashPreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar imagem pronta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rio-sugarloaf">Rio de Janeiro - Pão de Açúcar</SelectItem>
                    <SelectItem value="family-celebration">Celebração em Família</SelectItem>
                    <SelectItem value="sunset-beach">Pôr do Sol na Praia</SelectItem>
                    <SelectItem value="mountain-landscape">Paisagem de Montanha</SelectItem>
                    <SelectItem value="city-lights">Luzes da Cidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reset Banner */}
            <Button
              variant="outline"
              onClick={() => updateBanner({
                enabled: true,
                title: 'CELEBRAÇÃO',
                subtitle: 'Momentos especiais em família',
                imageUrl: backgroundImage
              })}
              className="w-full flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Restaurar Banner Padrão
            </Button>
          </>
        )}
      </CardContent>

      {/* Context Preview Modal */}
      {previewMode && banner.enabled && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-96 rounded-lg overflow-hidden">
            {/* Simulated mobile screen */}
            <div className="w-full h-full bg-cover bg-center relative" 
                 style={{ backgroundImage: `url(${backgroundImage})` }}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-center pt-16 pb-8">
                  <span className="text-white text-2xl font-light tracking-wider italic drop-shadow-lg">
                    Família
                  </span>
                </div>
                
                {/* App Grid */}
                <div className="flex-1 px-8 grid grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-white/20 backdrop-blur-sm rounded-2xl" />
                  ))}
                </div>
                
                {/* Banner */}
                <div className="p-6">
                  <div className="w-full h-20 rounded-2xl overflow-hidden relative bg-gradient-to-r from-orange-400 to-pink-500">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${banner.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-4">
                      <h3 className="font-medium">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-sm opacity-90">{banner.subtitle}</p>
                      )}
                    </div>
                  </div>
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