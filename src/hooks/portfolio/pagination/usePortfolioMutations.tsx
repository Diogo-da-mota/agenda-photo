
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../useAuth';
import { useToast } from '../../use-toast';
import { 
  criarTrabalhoPortfolio, 
  excluirTrabalhoPortfolio,
  TrabalhoPortfolioResumo,
  CriarTrabalhoPortfolio
} from '@/services/portfolioService';
import { PORTFOLIO_QUERY_KEY } from '../usePortfolioBasic';
import { useOptimisticUpdates } from './useOptimisticUpdates';

export const usePortfolioMutations = (pageSize: number = 12) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const optimisticUpdates = useOptimisticUpdates(pageSize);

  // Mutation para criar trabalho com optimistic update
  const criarTrabalhoMutation = useMutation({
    mutationFn: (trabalho: CriarTrabalhoPortfolio) => {
      if (!user) throw new Error('Usuário não autenticado');
      return criarTrabalhoPortfolio(trabalho, user.id);
    },
    onMutate: (novoTrabalho) => optimisticUpdates.onCreateMutate(novoTrabalho),
    onError: (err, novoTrabalho, context) => {
      optimisticUpdates.onCreateError(context);
      
      toast({
        title: "Erro ao criar trabalho",
        description: err.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      toast({
        title: "Trabalho criado",
        description: "O trabalho foi adicionado ao seu portfólio com sucesso."
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEY] });
    }
  });

  // Mutation para excluir trabalho
  const excluirTrabalhoMutation = useMutation({
    mutationFn: (trabalhoId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      return excluirTrabalhoPortfolio(trabalhoId, user.id);
    },
    onMutate: (trabalhoId) => optimisticUpdates.onDeleteMutate(trabalhoId),
    onError: (err, trabalhoId, context) => {
      optimisticUpdates.onDeleteError(context);
      
      toast({
        title: "Erro ao excluir trabalho",
        description: err.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      toast({
        title: "Trabalho excluído",
        description: "O trabalho foi removido do seu portfólio."
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEY] });
    }
  });

  return {
    // Ações
    criarTrabalho: criarTrabalhoMutation.mutate,
    excluirTrabalho: excluirTrabalhoMutation.mutate,
    
    // Estados das mutations
    isCriando: criarTrabalhoMutation.isPending,
    isExcluindo: excluirTrabalhoMutation.isPending,
  };
};
