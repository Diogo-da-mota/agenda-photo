import { useQuery } from '@tanstack/react-query';
import { buscarHistoricoContrato, HistoricoContrato } from '../services/atividadeService';
import { useAuth } from './useAuth';

export const useContractHistory = (contractId: string | undefined) => {
  const { user } = useAuth();

  return useQuery<HistoricoContrato[]>({
    queryKey: ['contract-history', contractId, user?.id],
    queryFn: async () => {
      if (!contractId || !user?.id) {
        console.warn('useContractHistory: Contract ID ou User ID não fornecido', { contractId, userId: user?.id });
        return [];
      }
      
      try {
        const result = await buscarHistoricoContrato(contractId, user.id);
        console.log('useContractHistory: Histórico carregado', { contractId, count: result.length });
        return result;
      } catch (error) {
        console.error('useContractHistory: Erro ao buscar histórico', { contractId, error });
        // Retornar array vazio em caso de erro para permitir fallback
        return [];
      }
    },
    enabled: !!contractId && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2, // Tentar 2 vezes em caso de erro
    retryDelay: 1000, // Aguardar 1 segundo entre tentativas
  });
};