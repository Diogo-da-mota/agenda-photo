import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getUserIntegrations, UserIntegration } from '@/services/userIntegrationService';

// Componentes de integração
import IntegrationCard from './integrations/IntegrationCard';
import { IntegrationsList } from './integrations/IntegrationsList';
import CustomDomainInput from './integrations/CustomDomainInput';

// Mock data para plano pago (Em uma aplicação real, isso viria de uma verificação de assinatura)
const MOCK_USER_HAS_PAID_PLAN = true;

interface ConfiguracaoIntegracao {
  id: string;
  user_id: string;
  webhook_enabled: boolean;
  webhook_url?: string;
  custom_domain?: string;
  company_logo?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export const IntegrationsSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState({
    webhook: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userIntegrationSettings, setUserIntegrationSettings] = useState<ConfiguracaoIntegracao | null>(null);

  // Carregar configurações de integração do usuário do banco de dados
  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        setIsLoading(true);
        const settings = await getUserIntegrations();
        
        if (settings && settings.length > 0) {
          const firstSetting = settings[0] as ConfiguracaoIntegracao;
          setUserIntegrationSettings(firstSetting);
          // Atualizar o estado das integrações com base nas configurações do usuário
          setIntegrations(prev => ({
            ...prev,
            webhook: firstSetting.webhook_enabled || false
          }));
        }
        
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleIntegrationToggle = (integration: keyof typeof integrations) => {
    setIntegrations(prev => ({ ...prev, [integration]: !prev[integration] }));
    
    const messages: Record<string, string> = {
      webhook: integrations.webhook ? "Webhook desativado" : "Webhook ativado"
    };

  };

  return (
    <div className="space-y-6">
      <IntegrationCard 
        title="APIs e Integrações" 
        description="Conecte sua conta a serviços externos para ampliar as funcionalidades."
      >
        <div className="space-y-5">
          {/* Campo de domínio personalizado */}
          <CustomDomainInput hasPaidPlan={MOCK_USER_HAS_PAID_PLAN} />
          
          {/* Lista de integrações disponíveis */}
          <IntegrationsList 
            integrations={{ ...integrations, whatsapp: false, payments: false, digitalSignature: false }}
            onToggleIntegration={handleIntegrationToggle}
            hasPaidPlan={MOCK_USER_HAS_PAID_PLAN}
          />
        </div>
      </IntegrationCard>
    </div>
  );
};
