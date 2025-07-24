import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useContractCounts } from '@/hooks/useContractCounts';
import { useMessageCounts } from '@/hooks/useMessageCounts';

export const SidebarBadgeStatus = () => {
  const { counts: contractCounts, isLoading: contractsLoading } = useContractCounts({ enabled: true });
  const { counts: messageCounts, isLoading: messagesLoading } = useMessageCounts();

  if (contractsLoading || messagesLoading) {
    return (
      <div className="p-2 text-xs text-muted-foreground">
        Carregando contadores...
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      <div className="text-xs text-muted-foreground mb-2">Status dos Badges:</div>
      
      <div className="flex items-center justify-between text-xs">
        <span>Contratos Pendentes:</span>
        <Badge variant={contractCounts.pendentes > 0 ? "destructive" : "secondary"}>
          {contractCounts.pendentes}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span>Mensagens Recentes:</span>
        <Badge variant={messageCounts.naoLidas > 0 ? "default" : "secondary"}>
          {messageCounts.naoLidas}
        </Badge>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        Total: {contractCounts.total} contratos, {messageCounts.total} mensagens
      </div>
    </div>
  );
};
