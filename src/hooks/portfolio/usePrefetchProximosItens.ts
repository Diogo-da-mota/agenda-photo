import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { buscarTrabalhosPortfolioOtimizado, TrabalhoPortfolioResumo } from '@/services/portfolioService';

/**
 * Hook para prefetch inteligente de próximos itens da lista
 * Carrega próxima página quando usuário está próximo do fim
 */
export const usePrefetchProximosItens = (
  currentPage: number,
  pageSize: number,
  searchTerm: string = '',
  hasNextPage: boolean = false,
  total: number = 0
) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const prefetchNextPage = useCallback(async () => {
    if (!user?.id || !hasNextPage) return;

    const nextPage = currentPage + 1;
    const queryKey = ['portfolio-trabalhos', 'paginado', 'todos', pageSize, searchTerm, nextPage];

    try {
      // Verificar se próxima página já está em cache
      const existingData = queryClient.getQueryData(queryKey);
      
      if (existingData) {
        console.log(`[PrefetchNext] Página ${nextPage} já em cache`);
        return;
      }

      console.log(`[PrefetchNext] Pré-carregando página ${nextPage}...`);

      // Prefetch da próxima página
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => buscarTrabalhosPortfolioOtimizado(
          user.id,
          nextPage,
          pageSize,
          searchTerm
        ),
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos em memória
      });

      console.log(`[PrefetchNext] ✅ Página ${nextPage} pré-carregada`);
    } catch (error) {
      console.warn(`[PrefetchNext] Erro ao pré-carregar página ${nextPage}:`, error);
    }
  }, [queryClient, user?.id, currentPage, pageSize, searchTerm, hasNextPage]);

  const prefetchWorkDetails = useCallback(async (trabalhos: TrabalhoPortfolioResumo[]) => {
    if (!user?.id || !trabalhos.length) return;

    // Pré-carregar detalhes dos próximos 3 itens que não estão em cache
    const proximosItens = trabalhos.slice(0, 3);

    for (const trabalho of proximosItens) {
      if (trabalho.id.startsWith('placeholder-')) continue;

      const queryKey = ['portfolio-trabalho', trabalho.id];
      const existingData = queryClient.getQueryData(queryKey);

      if (!existingData) {
        console.log(`[PrefetchDetails] Pré-carregando detalhes do trabalho ${trabalho.id}`);
        
        // Não awaitar para não bloquear
        queryClient.prefetchQuery({
          queryKey,
          queryFn: async () => {
            const { buscarTrabalhoPorId } = await import('@/services/portfolioService');
            return buscarTrabalhoPorId(trabalho.id, user.id);
          },
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 10,
        }).catch(error => {
          console.warn(`[PrefetchDetails] Erro ao pré-carregar ${trabalho.id}:`, error);
        });
      }
    }
  }, [queryClient, user?.id]);

  // Auto-prefetch baseado na posição de scroll
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // Quando usuário está a 60% da página, começar prefetch
      if (scrollPercentage > 0.6 && hasNextPage) {
        prefetchNextPage();
      }
    };

    // Throttle do scroll para performance
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 200);
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(timeoutId);
    };
  }, [prefetchNextPage, hasNextPage]);

  return {
    prefetchNextPage,
    prefetchWorkDetails
  };
};
