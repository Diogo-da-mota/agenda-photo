import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../../useAuth';
import { 
  buscarTrabalhosPortfolioOtimizado,
  buscarTrabalhosPortfolioPublicos,
  TrabalhoPortfolioResumo
} from '@/services/portfolioService';
import { PORTFOLIO_QUERY_KEY } from '../usePortfolioBasic';
import { queryConfigs } from '@/lib/react-query-config';

export const useInfinitePortfolio = (
  pageSize: number = 12,
  searchTerm: string = ''
) => {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error
  } = useInfiniteQuery({
    queryKey: [PORTFOLIO_QUERY_KEY, 'paginado', 'todos', pageSize, searchTerm],
    queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
      // Se o usuário estiver logado, buscar os trabalhos específicos do usuário
      if (user) {
          return await buscarTrabalhosPortfolioOtimizado(
            user.id, 
            pageParam, 
            pageSize,
            searchTerm
          );
      } else {
        // Para usuários não logados, buscar todos os trabalhos públicos
        return await buscarTrabalhosPortfolioPublicos(pageParam, pageSize, searchTerm);
      }
    },
    getNextPageParam: (lastPage: { trabalhos: TrabalhoPortfolioResumo[]; total: number }, allPages) => {
      if (!lastPage) return undefined;
      const totalLoaded = allPages.flatMap(page => page.trabalhos).length;
      return totalLoaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    ...queryConfigs.portfolio,
    placeholderData: keepPreviousData,
  });

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
