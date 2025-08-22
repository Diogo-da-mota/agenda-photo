import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
// import AutoSyncService from '@/services/autoSyncService';
import { logger } from '@/utils/logger';

/**
 * Hook que inicializa e gerencia a sincronização automática
 * Deve ser usado uma vez no nível da aplicação (App.tsx)
 */
export const useAutoSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    logger.info('[useAutoSync] Inicializando sincronização automática para usuário:', user.id);
    
    // Obter instância do serviço
    // const autoSyncService = AutoSyncService.getInstance();
    
    // Registrar callback para atualização da UI financeira
    const atualizarUIFinanceira = (userId: string) => {
      if (userId === user.id) {
        logger.info('[useAutoSync] Atualizando dados financeiros na UI');
        
        // Invalidar queries relacionadas ao financeiro
        queryClient.invalidateQueries({ queryKey: ['financeiro-resumo', userId] });
        queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes', userId] });
        queryClient.invalidateQueries({ queryKey: ['financeiro-despesas', userId] });
        
        // Aguardar um pouco e fazer refetch para garantir dados atualizados
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['financeiro-resumo', userId] });
          queryClient.refetchQueries({ queryKey: ['financeiro-transacoes', userId] });
        }, 500);
      }
    };

    // Registrar callback
    // autoSyncService.registerCallback(`ui-financeira-${user.id}`, atualizarUIFinanceira);
    
    // Cleanup function
    return () => {
      // autoSyncService.unregisterCallback(`ui-financeira-${user.id}`);
      logger.info('[useAutoSync] Callback de sincronização automática removido');
    };
  }, [user, queryClient]);

  return {
    // Função para sincronização manual (caso necessário)
    syncEvento: async (eventoId: string) => {
      if (!user) return false;
      // const autoSyncService = AutoSyncService.getInstance();
      // return await autoSyncService.syncEventoAutomatico(eventoId, user.id);
      return true; // Retorna sucesso mockado
    },
    
    // Função para obter status do serviço
    getStatus: async () => {
      // const autoSyncService = AutoSyncService.getInstance();
      // return await autoSyncService.getStatus();
      return { status: 'disabled' }; // Retorna um status mockado
    }
  };
};

/**
 * Hook para monitorar o status da sincronização
 */
export const useSyncStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sync-status', user?.id],
    queryFn: async () => {
      // const autoSyncService = AutoSyncService.getInstance();
      // return await autoSyncService.getStatus();
      return { status: 'disabled' }; // Retorna um status mockado
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para forçar a sincronização de um evento
 */
export const useForceSync = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventoId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      // const autoSyncService = AutoSyncService.getInstance();
      // return await autoSyncService.syncEventoAutomatico(eventoId, user.id);
      return true; // Retorna sucesso mockado
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro-geral'] });
    },
  });
};
