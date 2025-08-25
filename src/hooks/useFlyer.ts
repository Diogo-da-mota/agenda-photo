
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type FlyerColors = {
  primary?: string;
  secondary?: string;
  text?: string;
  background?: string;
};

export type FlyerData = {
  id?: string;
  nome_evento?: string;
  cidade?: string;
  data?: string;
  detalhes?: string;
  image_url?: string;
  cores?: FlyerColors;
};

export const useFlyer = () => {
  const [flyerData, setFlyerData] = useState<FlyerData>({
    cores: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      text: "#ffffff",
      background: "#111827"
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Since the flyers_customizados table was removed, we're providing a client-side only implementation
  const loadFlyerData = async () => {
    // This is now a stub function that just sets default values
    setLoading(true);
    
    try {
      console.log('Using local flyer data since the database table was removed');
      
      // Set default flyer data
      setFlyerData({
        nome_evento: "Evento Exemplo",
        cidade: "São Paulo",
        data: "01/01/2026",
        detalhes: "Detalhes do evento...",
        cores: {
          primary: "#3b82f6",
          secondary: "#8b5cf6", 
          text: "#ffffff",
          background: "#111827"
        }
      });
    } catch (error) {
      console.error('Erro ao carregar dados do flyer:', error);
      toast({
        title: "Erro ao carregar personalização",
        description: "Não foi possível carregar suas configurações salvas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFlyerData = async (data: Partial<FlyerData>) => {
    if (!user) {
      toast({
        title: "Ação restrita",
        description: "Você precisa estar logado para salvar suas configurações.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      console.log('Saving flyer data (client-side only):', data);
      
      // Locally update the flyer data without database persistence
      const updatedData = {
        ...flyerData,
        ...data
      };
      
      setFlyerData(updatedData);

    } catch (error) {
      console.error('Erro ao salvar dados do flyer:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFlyerField = (field: keyof FlyerData, value: any) => {
    const updatedData = { ...flyerData, [field]: value };
    setFlyerData(updatedData);
  };

  const updateFlyerColor = (colorKey: keyof FlyerColors, value: string) => {
    const updatedColors = { 
      ...(flyerData.cores || {}), 
      [colorKey]: value 
    };
    
    setFlyerData({
      ...flyerData,
      cores: updatedColors
    });
  };

  return {
    flyerData,
    loading,
    saving,
    updateFlyerField,
    updateFlyerColor,
    loadFlyerData,
    saveFlyerData
  };
};
