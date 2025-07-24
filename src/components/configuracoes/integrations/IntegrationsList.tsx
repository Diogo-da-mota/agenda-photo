
import React from 'react';
import WebhookIntegration from './WebhookIntegration';

interface IntegrationsListProps {
  integrations: {
    whatsapp: boolean;
    payments: boolean;
    digitalSignature: boolean;
    webhook: boolean;
  };
  onToggleIntegration: (integration: string) => void;
  hasPaidPlan: boolean;
}

export const IntegrationsList: React.FC<IntegrationsListProps> = ({
  integrations,
  onToggleIntegration,
  hasPaidPlan
}) => {
  return (
    <div className="space-y-4">
      <WebhookIntegration
        isActive={integrations.webhook}
        hasPaidPlan={hasPaidPlan}
        onToggle={() => onToggleIntegration('webhook')}
      />
    </div>
  );
};
