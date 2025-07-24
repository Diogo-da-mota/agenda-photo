
import React, { useState, useEffect } from 'react';
import { Webhook } from 'lucide-react';
import IntegrationItem from './IntegrationItem';
import { 
  WebhookDomainConfig,
  WebhookUrlInput,
  WebhookDocumentation
} from './webhook';
import { useWebhook } from '@/hooks/useWebhook';

interface WebhookIntegrationProps {
  isActive: boolean;
  hasPaidPlan: boolean;
  onToggle: () => void;
}

const WebhookIntegration: React.FC<WebhookIntegrationProps> = ({
  isActive,
  hasPaidPlan = false,
  onToggle
}) => {
  const { settings, updateSettings } = useWebhook();
  const [webhookUrl, setWebhookUrl] = useState<string>(settings.webhookUrl || '');
  const [domainInput, setDomainInput] = useState<string>(settings.customDomain || '');

  // Atualiza os estados locais quando as configurações do webhook são carregadas
  useEffect(() => {
    if (settings.webhookUrl !== undefined) {
      setWebhookUrl(settings.webhookUrl);
    }
    if (settings.customDomain) {
      setDomainInput(settings.customDomain);
    }
  }, [settings.webhookUrl, settings.customDomain]);

  const handleToggleWebhook = (toggleCallback: () => void) => {
    updateSettings({ enabled: !settings.enabled });
    toggleCallback();
  };

  const handleSaveDomain = async () => {
    await updateSettings({ customDomain: domainInput });
  };

  const handleSaveWebhookUrl = async () => {
    await updateSettings({ webhookUrl });
  };

  const handleTestWebhook = async () => {
    console.log("Testando webhook URL:", webhookUrl);
    // Lógica para testar webhook
  };

  return (
    <div className="space-y-4">
      {/* Domain Configuration Section */}
      <WebhookDomainConfig
        savedDomain={settings.customDomain}
        domainInput={domainInput}
        setDomainInput={setDomainInput}
        isLoading={settings.isLoading}
        webhookId={settings.id}
        onSaveDomain={handleSaveDomain}
      />

      <IntegrationItem
        id="webhook"
        icon={<Webhook className="h-5 w-5 text-blue-600" />}
        title="Webhook de Integração"
        description="Adicione uma URL de webhook para integrar notificações automáticas com serviços externos como WhatsApp, CRM e automação de atendimento."
        isActive={isActive}
        onToggle={() => handleToggleWebhook(onToggle)}
      />
      
      {isActive && (
        <div className="ml-10 mr-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-4">            
            {/* External Webhook URL */}
            <WebhookUrlInput
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
              isLoading={settings.isLoading}
              onSaveWebhook={handleSaveWebhookUrl}
              onTestWebhook={handleTestWebhook}
            />
            
            {/* Documentação */}
            <WebhookDocumentation />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookIntegration;
