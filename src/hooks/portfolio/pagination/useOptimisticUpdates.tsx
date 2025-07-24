
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../useAuth';
import { 
  TrabalhoPortfolioResumo,
  CriarTrabalhoPortfolio
} from '@/services/portfolioService';
import { PORTFOLIO_QUERY_KEY } from '../usePortfolioBasic';

export const useOptimisticUpdates = (pageSize: number = 12) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const onCreateMutate = async (novoTrabalho: CriarTrabalhoPortfolio) => {
    // Cancelar queries em andamento
    await queryClient.cancelQueries({ queryKey: [PORTFOLIO_QUERY_KEY] });
    
    // Snapshot do estado anterior
    const previousData = queryClient.getQueryData([PORTFOLIO_QUERY_KEY, 'paginado', user?.id, pageSize]);
    
    // Atualização otimista
    const trabalhoTemporario: TrabalhoPortfolioResumo = {
      id: `temp-${Date.now()}`,
      titulo: novoTrabalho.titulo,
      categoria: novoTrabalho.categoria,
      local: novoTrabalho.local,
      descricao: novoTrabalho.descricao,
      imagem_principal: novoTrabalho.imagens.length > 0 ? novoTrabalho.imagens[0] : null,
      criado_em: new Date().toISOString(),
      tags_preview: novoTrabalho.tags.slice(0, 3)
    };
    
    queryClient.setQueryData([PORTFOLIO_QUERY_KEY, 'paginado', user?.id, pageSize], (old: any) => {
      if (!old || !old.pages) return old;
      
      const newPages = [...old.pages];
      if (newPages.length > 0) {
        newPages[0] = {
          ...newPages[0],
          trabalhos: [trabalhoTemporario, ...newPages[0].trabalhos],
          total: newPages[0].total + 1
        };
      }
      
      return {
        ...old,
        pages: newPages
      };
    });
    
    return { previousData };
  };

  const onCreateError = (context: any) => {
    // Reverter em caso de erro
    if (context?.previousData) {
      queryClient.setQueryData([PORTFOLIO_QUERY_KEY, 'paginado', user?.id, pageSize], context.previousData);
    }
  };

  const onDeleteMutate = async (trabalhoId: string) => {
    // Cancelar queries em andamento
    await queryClient.cancelQueries({ queryKey: [PORTFOLIO_QUERY_KEY] });
    
    // Snapshot do estado anterior
    const previousData = queryClient.getQueryData([PORTFOLIO_QUERY_KEY, 'paginado', user?.id, pageSize]);
    
    // Atualização otimista - remover o trabalho
    queryClient.setQueryData([PORTFOLIO_QUERY_KEY, 'paginado', user?.id, pageSize], (old: any) => {
      if (!old || !old.pages) return old;
      
      const newPages = old.pages.map((page: { trabalhos: TrabalhoPortfolioResumo[]; total: number }) => ({
        ...page,
        trabalhos: page.trabalhos.filter((t: TrabalhoPortfolioResumo) => t.id !== trabalhoId),
        total: Math.max(0, page.total - 1)
      }));
      
      return {
        ...old,
        pages: newPages
      };
    });
    
    return { previousData };
  };

  const onDeleteError = (context: any) => {
    // Reverter em caso de erro
    if (context?.previousData) {
      queryClient.setQueryData([PORTFOLIO_QUERY_KEY, 'paginado', user?.id, pageSize], context.previousData);
    }
  };

  return {
    onCreateMutate,
    onCreateError,
    onDeleteMutate,
    onDeleteError,
  };
};
