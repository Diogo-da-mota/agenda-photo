import React from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useToast } from '../use-toast';
import { 
  buscarTrabalhosPortfolioPublicos,
  buscarTrabalhoPublicoPorId,
  TrabalhoPortfolioResumo
} from '@/services/portfolioService';
import { PORTFOLIO_QUERY_KEY } from './usePortfolioBasic';
import { queryConfigs } from '@/lib/react-query-config';

// Hook para portfólio público - não requer autenticação
export const usePortfolioPublico = (pageSize: number = 12) => {
  const { toast } = useToast();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error
  } = useInfiniteQuery({
    queryKey: [PORTFOLIO_QUERY_KEY, 'publico', pageSize],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) => {
      return buscarTrabalhosPortfolioPublicos(pageParam, pageSize);
    },
    getNextPageParam: (lastPage: { trabalhos: TrabalhoPortfolioResumo[]; total: number }, pages) => {
      const totalLoaded = pages.length * pageSize;
      return totalLoaded < lastPage.total ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
    ...queryConfigs.portfolio,
    // Configurações de retry para timeouts
    retry: (failureCount, error: any) => {
      // Retry até 3 vezes para timeouts
      if (error?.code === '57014' || error?.message?.includes('timeout')) {
        return failureCount < 3;
      }
      // Para outros erros, retry apenas 1 vez
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
  });

  // Mostrar toast apenas para erros persistentes
  React.useEffect(() => {
    if (error && !isLoading) {
      toast({
        title: "Erro ao carregar portfólio",
        description: "Tentando novamente... Se o problema persistir, recarregue a página.",
        variant: "destructive"
      });
    }
  }, [error, isLoading, toast]);

  return {
    // Dados
    trabalhos: data?.pages.flatMap(page => page.trabalhos) || [],
    total: data?.pages[0]?.total || 0,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    
    // Ações
    fetchNextPage,
  };
};

// Hook para trabalho público individual
export const useTrabalhoPublico = (trabalhoId: string) => {
  const { toast } = useToast();

  // Query para buscar trabalho específico público
  const {
    data: trabalho,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [PORTFOLIO_QUERY_KEY, 'publico', 'individual', trabalhoId],
    queryFn: async () => {
      if (!trabalhoId) {
        return Promise.resolve(null);
      }
      
      return await buscarTrabalhoPublicoPorId(trabalhoId);
    },
    enabled: !!trabalhoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    // Dados
    trabalho,
    isLoading,
    error,
    
    // Ações
    refetch,
  };
};
