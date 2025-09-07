# Guia de Ícones PWA - Hub.App

## Ícones Necessários

Para o funcionamento completo do PWA, você precisa criar os seguintes ícones:

### Ícones Padrão (public/icons/)
- `icon-16x16.png` - Favicon padrão
- `icon-32x32.png` - Favicon padrão
- `icon-72x72.png` - Ícone básico Android
- `icon-96x96.png` - Ícone básico Android
- `icon-128x128.png` - Ícone médio
- `icon-144x144.png` - Ícone Windows Tile
- `icon-152x152.png` - Ícone iPad
- `icon-192x192.png` - Ícone padrão Android
- `icon-384x384.png` - Ícone grande
- `icon-512x512.png` - Ícone splash screen

### Ícones iOS (public/icons/)
- `apple-touch-icon-57x57.png`
- `apple-touch-icon-60x60.png`
- `apple-touch-icon-72x72.png`
- `apple-touch-icon-76x76.png`
- `apple-touch-icon-114x114.png`
- `apple-touch-icon-120x120.png`
- `apple-touch-icon-144x144.png`
- `apple-touch-icon-152x152.png`
- `apple-touch-icon-180x180.png`

### Ícones Windows (public/icons/)
- `icon-70x70.png`
- `icon-150x150.png`
- `icon-310x150.png`
- `icon-310x310.png`

### Splash Screens iOS (public/splash/)
- `apple-splash-640-1136.jpg` - iPhone 5/SE (320x568)
- `apple-splash-750-1334.jpg` - iPhone 6/7/8 (375x667)
- `apple-splash-828-1792.jpg` - iPhone XR (414x896)
- `apple-splash-1125-2436.jpg` - iPhone X/XS (375x812)
- `apple-splash-1170-2532.jpg` - iPhone 12/13 (390x844)
- `apple-splash-1284-2778.jpg` - iPhone 12/13 Pro Max (428x926)
- `apple-splash-1536-2048.jpg` - iPad (768x1024)
- `apple-splash-1668-2388.jpg` - iPad Pro 11" (834x1194)
- `apple-splash-2048-2732.jpg` - iPad Pro 12.9" (1024x1366)

### Ícones de Atalho (public/icons/)
- `shortcut-appstore.png` - 96x96
- `shortcut-settings.png` - 96x96

## Como Gerar os Ícones

### Opção 1: Ferramenta Online (Recomendada)
1. Acesse: https://realfavicongenerator.net/
2. Faça upload de um ícone quadrado de alta resolução (512x512 ou maior)
3. Configure as opções para cada plataforma
4. Baixe o pacote gerado
5. Extraia os arquivos na estrutura de pastas correta

### Opção 2: Ferramenta PWA Builder
1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload do ícone principal
3. Gere todos os tamanhos automaticamente
4. Baixe e organize nas pastas corretas

### Opção 3: Manual com ImageMagick
```bash
# Instalar ImageMagick
brew install imagemagick  # macOS
sudo apt install imagemagick  # Ubuntu

# Gerar todos os tamanhos a partir de um ícone 512x512
convert icon-original.png -resize 16x16 public/icons/icon-16x16.png
convert icon-original.png -resize 32x32 public/icons/icon-32x32.png
convert icon-original.png -resize 72x72 public/icons/icon-72x72.png
# ... repetir para todos os tamanhos
```

## Requisitos do Ícone Original

- **Formato**: PNG ou SVG
- **Tamanho mínimo**: 512x512 pixels
- **Fundo**: Transparente ou sólido (dependendo do design)
- **Design**: Simples e reconhecível em tamanhos pequenos
- **Cores**: Contrastantes para boa visibilidade

## Splash Screens

Para as splash screens do iOS, você pode:

1. **Usar a mesma arte do ícone** centralizada em um fundo sólido
2. **Criar designs específicos** para cada tamanho
3. **Usar ferramentas online** como https://appsco.pe/developer/splash-screens

## Validação

Após gerar os ícones:

1. Teste no Chrome DevTools > Application > Manifest
2. Verifique se todos os ícones carregam corretamente
3. Teste a instalação em diferentes dispositivos
4. Use ferramentas como Lighthouse para validar PWA

## Cores do Tema

- **Cor principal**: `#1e40af` (azul)
- **Cor de fundo**: `#000000` (preto)
- **Cor de texto**: `#ffffff` (branco)

Essas cores devem ser consistentes em todos os ícones e splash screens.