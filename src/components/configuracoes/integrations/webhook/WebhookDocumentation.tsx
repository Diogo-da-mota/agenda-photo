
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const WebhookDocumentation: React.FC = () => {
  return (
    <div className="pt-4 border-t border-gray-100">
      <h4 className="text-sm font-medium mb-2">Informações do Webhook</h4>
      <p className="text-xs text-gray-600 mb-2">
        Para utilizar este webhook, configure seu serviço externo para receber notificações POST 
        na URL acima. Cada notificação incluirá:
      </p>
      <ul className="text-xs text-gray-600 list-disc ml-5 space-y-1">
        <li>Tipo de evento (event_type)</li>
        <li>Data e hora do evento (timestamp)</li>
        <li>Dados relacionados ao evento (payload)</li>
        <li>ID único do evento (id)</li>
      </ul>
      <div className="mt-3">
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs p-0 h-auto"
          onClick={() => window.open('/docs/webhook-api', '_blank')}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Ver documentação completa
        </Button>
      </div>
    </div>
  );
};

export default WebhookDocumentation;
