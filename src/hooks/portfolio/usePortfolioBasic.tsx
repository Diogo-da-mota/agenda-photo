import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { buscarTrabalhosPortfolio, buscarTrabalhosPortfolioPublicos } from '@/services/portfolioService';
import { queryConfigs } from '@/lib/react-query-config';

export const PORTFOLIO_QUERY_KEY = 'portfolio-trabalhos';

export const usePortfolioBasic = () => {
  const { user } = useAuth();

  // Query para buscar todos os trabalhos do portfólio
  // Usando a função pública para garantir que todos os registros sejam exibidos
  const {
    data: trabalhos = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [PORTFOLIO_QUERY_KEY, 'todos'],
    queryFn: async () => {
      // Se o usuário estiver logado, buscar trabalhos específicos
      if (user) {
        try {
          const trabalhosUsuario = await buscarTrabalhosPortfolio(user.id);
          return trabalhosUsuario;
        } catch (err) {
          console.error("Erro ao buscar trabalhos do usuário:", err);
          // Em caso de erro, tentar buscar todos os trabalhos públicos
          const { trabalhos } = await buscarTrabalhosPortfolioPublicos(1, 100);
          return trabalhos;
        }
      } else {
        // Para usuários não logados, buscar todos os trabalhos públicos
        const { trabalhos } = await buscarTrabalhosPortfolioPublicos(1, 100);
        return trabalhos;
      }
    },
    ...queryConfigs.portfolio,
  });

  return {
    // Dados
    trabalhos,
    isLoading,
    error,
    refetch,
  };
};
