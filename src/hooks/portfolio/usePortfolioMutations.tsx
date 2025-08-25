
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { useToast } from '../use-toast';
import { 
  atualizarTrabalhoPortfolio,
  excluirTrabalhoPortfolio,
  CriarTrabalhoPortfolio
} from '@/services/portfolioService';
import { PORTFOLIO_QUERY_KEY } from './usePortfolioBasic';

export const usePortfolioMutations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para atualizar trabalho
  const atualizarTrabalhoMutation = useMutation({
    mutationFn: ({ trabalhoId, trabalho }: { trabalhoId: string; trabalho: Partial<CriarTrabalhoPortfolio> }) => {
      if (!user) throw new Error('Usuário não autenticado');
      return atualizarTrabalhoPortfolio(trabalhoId, trabalho, user.id);
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

  // Mutation para excluir trabalho
  const excluirTrabalhoMutation = useMutation({
    mutationFn: (trabalhoId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      return excluirTrabalhoPortfolio(trabalhoId, user.id);
    },
    onSuccess: () => {
      // Invalidar e atualizar o cache
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEY] });

    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir trabalho",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  });

  return {
    // Ações
    atualizarTrabalho: atualizarTrabalhoMutation.mutate,
    excluirTrabalho: excluirTrabalhoMutation.mutate,
    
    // Estados das mutations
    isAtualizando: atualizarTrabalhoMutation.isPending,
    isExcluindo: excluirTrabalhoMutation.isPending,
  };
};
