import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { buscarTrabalhoPorId } from '@/services/portfolioService';
import { useCallback } from 'react';

/**
 * Hook para pré-carregar dados de trabalho no hover
 * Melhora a performance percebida pelo usuário
 */
export const usePrefetchTrabalho = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const prefetchTrabalho = useCallback(async (trabalhoId: string) => {
    if (!user?.id || !trabalhoId) return;

    try {
      // Verificar se os dados já estão em cache
      const existingData = queryClient.getQueryData(['portfolio-trabalho', trabalhoId]);
      
      if (existingData) {
        console.log(`[Prefetch] Dados do trabalho ${trabalhoId} já em cache`);
        return;
      }

      console.log(`[Prefetch] Iniciando pré-carregamento do trabalho ${trabalhoId}`);

      // Fazer prefetch dos dados
      await queryClient.prefetchQuery({
        queryKey: ['portfolio-trabalho', trabalhoId],
        queryFn: () => buscarTrabalhoPorId(trabalhoId, user.id),
        staleTime: 1000 * 60 * 5, // 5 minutos de cache
        gcTime: 1000 * 60 * 10, // 10 minutos em memória
      });

      // Log removido para produção - trabalho pré-carregado
    } catch (error) {
      // Log de erro removido para produção - erro ao pré-carregar trabalho
      // Não bloquear a interface por erros de prefetch
    }
  }, [queryClient, user?.id]);

  const cancelPrefetch = useCallback((trabalhoId: string) => {
    // Cancelar queries em andamento se necessário
    queryClient.cancelQueries({ queryKey: ['portfolio-trabalho', trabalhoId] });
  }, [queryClient]);

  return {
    prefetchTrabalho,
    cancelPrefetch
  };
};
