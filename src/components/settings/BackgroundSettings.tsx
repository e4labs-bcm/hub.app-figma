import { useState, useRef } from 'react';
import { Upload, Eye, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { useSettings } from '../../hooks/useSettings';
import backgroundImage from '../../assets/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png';

export function BackgroundSettings() {
  const { background, updateBackground } = useSettings();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 2MB limit as requested
    const maxSizeInMB = 2; // 2MB limit 
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (file.size > maxSizeInBytes) {
      alert(`A imagem é muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). Por favor, escolha uma imagem menor que ${maxSizeInMB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imageUrl = e.target?.result as string;
          
          // Increased base64 limit to 2MB 
          if (imageUrl.length > 2000000) { // ~2MB base64
            alert('A imagem processada é muito grande. Tente uma imagem menor ou use as opções pré-definidas.');
            setUploading(false);
            return;
          }
          
          updateBackground({ image: imageUrl });
          setUploading(false);
        } catch (error) {
          console.error('Error processing image:', error);
          alert('Erro ao processar a imagem. Tente novamente.');
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
      setUploading(false);
    }
  };

  const handleUnsplashSearch = (query: string) => {
    console.log('Selecionando imagem:', query);
    
    // Prevenir múltiplas chamadas rápidas
    if (uploading) return;
    
    setUploading(true);
    
    try {
      // Detectar se é mobile
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      
      // URLs específicas para mobile e desktop
      const mobileUrls = {
        'family gathering': 'https://picsum.photos/800/600?random=1',
        'nature landscape': 'https://picsum.photos/800/600?random=2', 
        'sunset mountains': 'https://picsum.photos/800/600?random=3',
        'beach ocean': 'https://picsum.photos/800/600?random=4',
        'forest trees': 'https://picsum.photos/800/600?random=5',
        'city skyline': 'https://picsum.photos/800/600?random=6',
        'minimal abstract': 'https://picsum.photos/800/600?random=7'
      };
      
      const desktopUrls = {
        'family gathering': 'https://images.unsplash.com/photo-1511895426328-dc8714ead300?w=800&h=600&fit=crop&crop=center',
        'nature landscape': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
        'sunset mountains': 'https://images.unsplash.com/photo-1464822759844-d150ad6d1c20?w=800&h=600&fit=crop&crop=center',
        'beach ocean': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&crop=center',
        'forest trees': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
        'city skyline': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop&crop=center',
        'minimal abstract': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=center'
      };
      
      const imageUrls = isMobileDevice ? mobileUrls : desktopUrls;
      const imageUrl = imageUrls[query as keyof typeof imageUrls] || imageUrls['nature landscape'];
      
      console.log('URL da imagem selecionada:', imageUrl, 'Mobile:', isMobileDevice);
      
      // Para mobile, aplicar diretamente sem pré-carregamento
      if (isMobileDevice) {
        setTimeout(() => {
          try {
            updateBackground({ image: imageUrl });
            console.log('Background aplicado diretamente no mobile');
          } catch (error) {
            console.error('Erro ao aplicar background:', error);
          } finally {
            setUploading(false);
          }
        }, 100);
      } else {
        // Para desktop, manter o pré-carregamento
        const img = new Image();
        img.onload = () => {
          try {
            updateBackground({ image: imageUrl });
            console.log('Background atualizado - Desktop');
          } catch (error) {
            console.error('Erro ao atualizar background:', error);
          } finally {
            setUploading(false);
          }
        };
        
        img.onerror = () => {
          try {
            updateBackground({ image: imageUrl });
            console.log('Background aplicado após erro de carregamento');
          } catch (error) {
            console.error('Erro ao atualizar background após erro:', error);
          } finally {
            setUploading(false);
          }
        };
        
        img.src = imageUrl;
      }
      
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      setUploading(false);
    }
  };

  const previewStyle = {
    backgroundImage: `url(${background.image})`,
    backgroundPosition: background.position,
    backgroundSize: background.size,
    opacity: background.opacity
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Imagem de Fundo
        </CardTitle>
        <CardDescription>
          Personalize a imagem de fundo da tela inicial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Background Preview */}
        <div className="space-y-3">
          <Label>Preview Atual</Label>
          <div 
            className="w-full h-32 rounded-lg border border-border bg-cover bg-center relative overflow-hidden"
            style={previewStyle}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-medium drop-shadow-lg">
                Família
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {isPreviewMode ? 'Ocultar Preview' : 'Preview em Tela Cheia'}
            </Button>
          </div>
        </div>

        {/* Upload Options */}
        <div className="space-y-4">
          <div>
            <Label>Escolher Nova Imagem</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Imagens personalizadas são temporárias e não são salvas permanentemente devido às limitações do navegador. Para uso permanente, use as opções pré-definidas.
            </p>
          </div>
          
          {/* Upload from device */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
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
                {uploading ? 'Enviando...' : 'Enviar do Dispositivo (Temporário)'}
              </Button>
            </div>

            {/* Quick Unsplash options */}
            <div className="space-y-2">
              <Select onValueChange={handleUnsplashSearch} disabled={uploading}>
                <SelectTrigger className={uploading ? "opacity-50" : ""}>
                  <SelectValue placeholder={uploading ? "Carregando..." : "Imagens Prontas"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family gathering">Família Reunida</SelectItem>
                  <SelectItem value="nature landscape">Paisagem Natural</SelectItem>
                  <SelectItem value="sunset mountains">Pôr do Sol</SelectItem>
                  <SelectItem value="beach ocean">Praia e Oceano</SelectItem>
                  <SelectItem value="forest trees">Floresta</SelectItem>
                  <SelectItem value="city skyline">Cidade</SelectItem>
                  <SelectItem value="minimal abstract">Abstrato Minimalista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Position Settings */}
        <div className="space-y-3">
          <Label>Posicionamento da Imagem</Label>
          <Select 
            value={background.position} 
            onValueChange={(value) => {
              try {
                updateBackground({ position: value as any });
              } catch (error) {
                console.error('Error updating position:', error);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="top">Topo</SelectItem>
              <SelectItem value="bottom">Inferior</SelectItem>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Size Settings */}
        <div className="space-y-3">
          <Label>Tamanho da Imagem</Label>
          <Select 
            value={background.size} 
            onValueChange={(value) => {
              try {
                updateBackground({ size: value as any });
              } catch (error) {
                console.error('Error updating size:', error);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cobrir (Padrão)</SelectItem>
              <SelectItem value="contain">Conter</SelectItem>
              <SelectItem value="auto">Tamanho Original</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Opacity Settings */}
        <div className="space-y-3">
          <Label>Opacidade: {Math.round(background.opacity * 100)}%</Label>
          <Slider
            value={[background.opacity]}
            onValueChange={(value) => {
              try {
                updateBackground({ opacity: value[0] });
              } catch (error) {
                console.error('Error updating opacity:', error);
              }
            }}
            max={1}
            min={0.1}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Reset to Default */}
        <Button
          variant="outline"
          onClick={() => updateBackground({
            image: backgroundImage,
            position: 'center',
            size: 'cover',
            opacity: 1
          })}
          className="w-full flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Restaurar Imagem Padrão
        </Button>
      </CardContent>

      {/* Full Screen Preview Modal - Mobile Optimized */}
      {isPreviewMode && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsPreviewMode(false)} // Close on backdrop click
        >
          <div 
            className="relative w-full max-w-4xl h-96 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
          >
            <div 
              className="w-full h-full bg-cover bg-center relative"
              style={previewStyle}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-2xl md:text-4xl font-light tracking-wider italic drop-shadow-lg">
                  Família
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsPreviewMode(false)}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-xs md:text-sm"
              size="sm"
            >
              ✕ Fechar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}