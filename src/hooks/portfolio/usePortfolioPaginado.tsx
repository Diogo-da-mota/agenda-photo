import { useInfinitePortfolio } from './pagination/useInfinitePortfolio';
import { usePortfolioMutations } from './pagination/usePortfolioMutations';

// Hook principal que combina paginação e mutations
export const usePortfolioPaginado = (
  pageSize: number = 12,
  searchTerm: string = ''
) => {
  const infiniteQuery = useInfinitePortfolio(pageSize, searchTerm);
  const mutations = usePortfolioMutations(pageSize);

  return {
    // Dados da query infinita
    ...infiniteQuery,
    
    // Mutations
    ...mutations,
  };
};
