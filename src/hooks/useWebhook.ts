import { useState, useEffect } from 'react';

interface WebhookSettings {
  id?: string;
  enabled: boolean;
  webhookUrl: string;
  customDomain: string;
  isLoading: boolean;
}

interface UseWebhookReturn {
  settings: WebhookSettings;
  updateSettings: (updates: Partial<WebhookSettings>) => Promise<void>;
}

export const useWebhook = (): UseWebhookReturn => {
  const [settings, setSettings] = useState<WebhookSettings>({
    enabled: false,
    webhookUrl: '',
    customDomain: '',
    isLoading: false,
  });

  // Carrega as configurações do webhook do localStorage na inicialização
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('webhook-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({
            ...prev,
            ...parsed,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do webhook:', error);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (updates: Partial<WebhookSettings>): Promise<void> => {
    setSettings(prev => ({ ...prev, isLoading: true }));

    try {
      const newSettings = { ...settings, ...updates };
      
      // Salva no localStorage
      localStorage.setItem('webhook-settings', JSON.stringify(newSettings));
      
      setSettings(prev => ({
        ...prev,
        ...updates,
        isLoading: false,
      }));

      console.log('Configurações do webhook atualizadas:', newSettings);
    } catch (error) {
      console.error('Erro ao atualizar configurações do webhook:', error);
      setSettings(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  return {
    settings,
    updateSettings,
  };
};