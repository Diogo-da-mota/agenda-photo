
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface IntegrationDetailsProps {
  children: React.ReactNode;
  hasActiveIntegrations: boolean;
}

const IntegrationDetails: React.FC<IntegrationDetailsProps> = ({ 
  children,
  hasActiveIntegrations
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Integração</CardTitle>
        <CardDescription>Informações e configurações adicionais sobre suas integrações ativas</CardDescription>
      </CardHeader>
      <CardContent>
        {hasActiveIntegrations ? (
          children
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-2">Nenhuma integração ativa</h3>
            <p className="text-sm text-muted-foreground">Conecte uma ou mais integrações acima para expandir as funcionalidades do sistema.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationDetails;
