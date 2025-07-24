import { useContractCounts } from '@/hooks/useContractCounts';
import { useMessageCounts } from '@/hooks/useMessageCounts';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export const useSidebarBadges = () => {
  const location = useLocation();
  
  // Verificar se estamos em rotas que precisam de dados de contratos
  const needsContractData = useMemo(() => {
    const contractRelatedRoutes = [
      '/contratos',
      '/dashboard',
      '/clientes',
      '/atividades-linha-do-tempo',
      '/relatorios'
    ];
    
    return contractRelatedRoutes.some(route => 
      location.pathname.startsWith(route)
    );
  }, [location.pathname]);
  
  // Só executar query de contratos quando necessário
  const { counts: contractCounts } = useContractCounts({ 
    enabled: needsContractData 
  });
  
  const { counts: messageCounts } = useMessageCounts();

  return {
    unreadMessages: messageCounts.naoLidas,
    pendingContracts: needsContractData ? contractCounts.pendentes : 0,
  };
};
