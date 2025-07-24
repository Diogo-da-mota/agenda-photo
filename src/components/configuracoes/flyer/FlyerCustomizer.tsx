
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFlyer } from '@/hooks/useFlyer';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import FlyerPreview from './FlyerPreview';

const FlyerCustomizer: React.FC = () => {
  const { flyerData, loading, saving, updateFlyerField, updateFlyerColor, saveFlyerData } = useFlyer();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tempValues, setTempValues] = useState({
    nome_evento: '',
    cidade: '',
    data: '',
    detalhes: ''
  });

  // Inicializar valores temporários com os dados carregados
  React.useEffect(() => {
    if (flyerData) {
      setTempValues({
        nome_evento: flyerData.nome_evento || '',
        cidade: flyerData.cidade || '',
        data: flyerData.data || '',
        detalhes: flyerData.detalhes || ''
      });
    }
  }, [flyerData]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveField = (field: string) => {
    updateFlyerField(field as keyof typeof flyerData, tempValues[field as keyof typeof tempValues]);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFlyerColor(name as keyof typeof flyerData.cores, value);
  };

  const handleSaveAll = () => {
    if (!user) {
      toast({
        title: "Ação restrita",
        description: "Você precisa estar logado para salvar suas configurações.",
        variant: "destructive"
      });
      return;
    }

    saveFlyerData(tempValues);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalização do Flyer</CardTitle>
          <CardDescription>
            Customize as informações e o estilo do seu flyer promocional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_evento">Nome do Evento</Label>
            <div className="flex space-x-2">
              <Input
                id="nome_evento"
                name="nome_evento"
                value={tempValues.nome_evento}
                onChange={handleFieldChange}
                placeholder="Digite o nome do evento"
              />
              <Button 
                size="sm" 
                onClick={() => handleSaveField('nome_evento')}
                className="shrink-0"
              >
                Aplicar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <div className="flex space-x-2">
              <Input
                id="cidade"
                name="cidade"
                value={tempValues.cidade}
                onChange={handleFieldChange}
                placeholder="Digite a cidade do evento"
              />
              <Button 
                size="sm" 
                onClick={() => handleSaveField('cidade')}
                className="shrink-0"
              >
                Aplicar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <div className="flex space-x-2">
              <Input
                id="data"
                name="data"
                value={tempValues.data}
                onChange={handleFieldChange}
                placeholder="DD/MM/AAAA"
              />
              <Button 
                size="sm" 
                onClick={() => handleSaveField('data')}
                className="shrink-0"
              >
                Aplicar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detalhes">Detalhes</Label>
            <div className="flex space-x-2">
              <Textarea
                id="detalhes"
                name="detalhes"
                value={tempValues.detalhes}
                onChange={handleFieldChange}
                placeholder="Adicione detalhes como horário, local específico, etc."
                rows={3}
              />
              <Button 
                size="sm" 
                onClick={() => handleSaveField('detalhes')}
                className="shrink-0"
              >
                Aplicar
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-4">Cores do Flyer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary" className="block mb-2">Cor Primária</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primary"
                    name="primary"
                    type="color"
                    value={flyerData.cores?.primary || "#3b82f6"}
                    onChange={handleColorChange}
                    className="w-full h-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary" className="block mb-2">Cor Secundária</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="secondary"
                    name="secondary"
                    type="color"
                    value={flyerData.cores?.secondary || "#8b5cf6"}
                    onChange={handleColorChange}
                    className="w-full h-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="text" className="block mb-2">Cor do Texto</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="text"
                    name="text"
                    type="color"
                    value={flyerData.cores?.text || "#ffffff"}
                    onChange={handleColorChange}
                    className="w-full h-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="background" className="block mb-2">Cor de Fundo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="background"
                    name="background"
                    type="color"
                    value={flyerData.cores?.background || "#111827"}
                    onChange={handleColorChange}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSaveAll} 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Todas Alterações
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <FlyerPreview flyerData={flyerData} />
    </div>
  );
};

export default FlyerCustomizer;
