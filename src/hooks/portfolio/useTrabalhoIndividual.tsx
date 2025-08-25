
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { useToast } from '../use-toast';
import { 
  buscarTrabalhoPorId,
  atualizarTrabalhoPortfolio,
  CriarTrabalhoPortfolio
} from '@/services/portfolioService';
import { buscarTrabalhoPorTitulo } from '@/services/portfolio/queries/basicQueries';
import { PORTFOLIO_QUERY_KEY } from './usePortfolioBasic';

// Hook separado para buscar trabalho individual
export const useTrabalhoIndividual = (trabalhoId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar trabalho específico
  const {
    data: trabalho,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [PORTFOLIO_QUERY_KEY, 'individual', trabalhoId, user?.id],
    queryFn: async () => {
      if (!user || !trabalhoId) {
        return Promise.resolve(null);
      }
      
      return await buscarTrabalhoPorId(trabalhoId, user.id);
    },
    enabled: !!user && !!trabalhoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation para atualizar trabalho
  const atualizarTrabalhoMutation = useMutation({
    mutationFn: (trabalhoAtualizado: Partial<CriarTrabalhoPortfolio>) => {
      if (!user || !trabalhoId) throw new Error('Usuário não autenticado ou ID do trabalho não fornecido');
      return atualizarTrabalhoPortfolio(trabalhoId, trabalhoAtualizado, user.id);
    },
    onSuccess: () => {
      // Invalidar e atualizar o cache
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEY] });

    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar trabalho",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  });

  return {
    // Dados
    trabalho,
    isLoading,
    error,
    
    // Ações
    atualizarTrabalho: atualizarTrabalhoMutation.mutate,
    refetch,
    
    // Estados das mutations
    isAtualizando: atualizarTrabalhoMutation.isPending,
  };
};

// Hook para buscar trabalho individual por título (para área administrativa)
export const useTrabalhoIndividualPorTitulo = (titulo: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar trabalho específico por título
  const {
    data: trabalho,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [PORTFOLIO_QUERY_KEY, 'individual-titulo', titulo, user?.id],
    queryFn: async () => {
      if (!user || !titulo) {
        return Promise.resolve(null);
      }
      
      return await buscarTrabalhoPorTitulo(titulo, user.id);
    },
    enabled: !!user && !!titulo,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation para atualizar trabalho (usando o ID do trabalho encontrado)
  const atualizarTrabalhoMutation = useMutation({
    mutationFn: (trabalhoAtualizado: Partial<CriarTrabalhoPortfolio>) => {
      if (!user || !trabalho?.id) throw new Error('Usuário não autenticado ou trabalho não encontrado');
      return atualizarTrabalhoPortfolio(trabalho.id, trabalhoAtualizado, user.id);
    },
    onSuccess: () => {
      // Invalidar e atualizar o cache
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEY] });

    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar trabalho",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  });

  return {
    // Dados
    trabalho,
    isLoading,
    error,
    
    // Ações
    atualizarTrabalho: atualizarTrabalhoMutation.mutate,
    refetch,
    
    // Estados das mutations
    isAtualizando: atualizarTrabalhoMutation.isPending,
  };
};
