
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { useToast } from '../use-toast';
import { 
  criarTrabalhoPortfolio, 
  criarTrabalhoComImagens,
  CriarTrabalhoPortfolio,
  CriarTrabalhoComImagens,
  ResultadoTrabalhoComImagens
} from '@/services/portfolioService';
import { PORTFOLIO_QUERY_KEY } from './usePortfolioBasic';

export const usePortfolioCreate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation para criar trabalho
  const criarTrabalhoMutation = useMutation({
    mutationFn: (trabalho: CriarTrabalhoPortfolio) => {
      if (!user) throw new Error('Usuário não autenticado');
      return criarTrabalhoPortfolio(trabalho, user.id);
    },
    onSuccess: (trabalhoSalvo) => {
      // Invalidar e atualizar o cache
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEY] });
      
      toast({
        title: "Trabalho criado",
        description: "O trabalho foi adicionado ao seu portfólio com sucesso."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar trabalho",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  });

  // Mutation para criar trabalho com múltiplas imagens
  const criarTrabalhoComImagensMutation = useMutation({
    mutationFn: (trabalhoData: CriarTrabalhoComImagens) => {
      if (!user) throw new Error('Usuário não autenticado');
      return criarTrabalhoComImagens(trabalhoData, user.id);
    },
    onSuccess: (resultado: ResultadoTrabalhoComImagens) => {
      // Invalidar e atualizar o cache
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_QUERY_KEY] });
      
      toast({
        title: "Trabalho criado",
        description: `Trabalho criado com ${resultado.imagens.length} imagens com sucesso.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar trabalho",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  });

  return {
    // Ações
    criarTrabalho: criarTrabalhoMutation.mutate,
    criarTrabalhoComImagens: criarTrabalhoComImagensMutation.mutate,
    
    // Estados das mutations
    isCriando: criarTrabalhoMutation.isPending,
    isCriandoComImagens: criarTrabalhoComImagensMutation.isPending,
  };
};
