import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import PortfolioNavBar from '@/components/portfolio/PortfolioNavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Palette, 
  Type, 
  Layout, 
  Image,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PortfolioDesign: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const activeTab = 'design';
  
  // Estados para configurações de design
  const [settings, setSettings] = useState({
    theme: 'elegante',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    font: 'inter',
    layout: 'grid',
    showWatermark: true,
    enableAnimations: true,
    mobileOptimized: true,
    titleFontSize: '2.5rem',
    bodyFontSize: '1rem',
    maxWidth: '1200px',
    galleryColumns: '3'
  });
  
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
  };

  const handlePreview = () => {
    
    // Aqui abriria o preview em nova janela
  };
  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header da página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Portfólio</h1>
            <p className="text-muted-foreground">
              Personalize a aparência e estilo do seu site
            </p>
            
            {/* Barra de navegação personalizada */}
            <PortfolioNavBar 
              activeTab={activeTab} 
              className="mt-4 -mx-4 sm:-mx-0" 
            />
          </div>
        </div>

        {/* Header Design & Aparência */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Design & Aparência</h2>
            <p className="text-sm text-muted-foreground">Personalize a aparência e estilo do seu site</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview} className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Visualização por dispositivo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Preview Responsivo
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`mx-auto bg-white border rounded-lg shadow-sm ${
              previewDevice === 'mobile' ? 'max-w-sm h-96' :
              previewDevice === 'tablet' ? 'max-w-md h-80' :
              'max-w-4xl h-64'
            }`}>
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Preview do site aparecerá aqui</p>
                  <p className="text-xs">Dispositivo: {previewDevice}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de configurações */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tema e Cores */}
          <Card>
            <CardHeader>
              <CardTitle>Tema e Cores</CardTitle>
              <CardDescription>
                Selecione o tema e personalize as cores do seu site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seleção de Tema */}
              <div>
                <Label>Tema</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => setSettings({ ...settings, theme: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elegante">Elegante</SelectItem>
                    <SelectItem value="moderno">Moderno</SelectItem>
                    <SelectItem value="artistic">Artístico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cores Primária e Secundária */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-10 h-10 p-0 border rounded-md cursor-pointer"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="secondary-color"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-10 h-10 p-0 border rounded-md cursor-pointer"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tipografia e Fontes */}
          <Card>
            <CardHeader>
              <CardTitle>Tipografia</CardTitle>
              <CardDescription>
                Configure as fontes e tamanhos de texto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fonte Principal */}
              <div>
                <Label>Fonte Principal</Label>
                <Select
                  value={settings.font}
                  onValueChange={(value) => setSettings({ ...settings, font: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="open-sans">Open Sans</SelectItem>
                    <SelectItem value="poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tamanhos de Texto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title-font-size">Tamanho Título</Label>
                  <Input
                    id="title-font-size"
                    value={settings.titleFontSize}
                    onChange={(e) => setSettings({ ...settings, titleFontSize: e.target.value })}
                    className="flex-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="body-font-size">Tamanho Corpo</Label>
                  <Input
                    id="body-font-size"
                    value={settings.bodyFontSize}
                    onChange={(e) => setSettings({ ...settings, bodyFontSize: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout e Estrutura */}
          <Card>
            <CardHeader>
              <CardTitle>Layout e Estrutura</CardTitle>
              <CardDescription>
                Configure o layout das páginas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Largura Máxima e Colunas da Galeria */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-width">Largura Máxima</Label>
                  <Input
                    id="max-width"
                    value={settings.maxWidth}
                    onChange={(e) => setSettings({ ...settings, maxWidth: e.target.value })}
                    className="flex-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gallery-columns">Colunas Galeria</Label>
                  <Input
                    id="gallery-columns"
                    value={settings.galleryColumns}
                    onChange={(e) => setSettings({ ...settings, galleryColumns: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Opções Adicionais */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-watermark">Mostrar Marca d'água</Label>
                  <Switch
                    id="show-watermark"
                    checked={settings.showWatermark}
                    onCheckedChange={(checked) => setSettings({ ...settings, showWatermark: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-animations">Ativar Animações</Label>
                  <Switch
                    id="enable-animations"
                    checked={settings.enableAnimations}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableAnimations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="mobile-optimized">Otimizado para Mobile</Label>
                  <Switch
                    id="mobile-optimized"
                    checked={settings.mobileOptimized}
                    onCheckedChange={(checked) => setSettings({ ...settings, mobileOptimized: checked })}
                  />
                </div>
              </div>            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default PortfolioDesign;
