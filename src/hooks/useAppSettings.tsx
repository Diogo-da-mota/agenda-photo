import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, saveSettings, ConfiguracaoEmpresa } from '@/services/settingsService';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<ConfiguracaoEmpresa | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar configurações ao inicializar
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        if (import.meta.env.MODE === 'development') {
          console.error('Erro ao carregar configurações:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    carregarConfiguracoes();
  }, []);

  // Função para carregar as configurações
  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao carregar configurações:', error);
      }
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar configurações
  const updateSettings = async (newSettings: Partial<ConfiguracaoEmpresa>) => {
    try {
      setLoading(true);
      const success = await saveSettings(newSettings);
      
      if (success) {
        // Atualizar estado local com as novas configurações
        setSettings(prev => prev ? { ...prev, ...newSettings } : { ...newSettings } as ConfiguracaoEmpresa);
        
      }
      
      return success;
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao atualizar configurações:', error);
      }
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: loadSettings,
    reloadSettings: loadSettings, // Alias para ser compatível com código existente
  };
};
