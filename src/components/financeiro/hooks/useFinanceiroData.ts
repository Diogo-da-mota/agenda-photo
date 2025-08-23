import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  buscarTransacoes, 
  buscarResumoFinanceiro,
  FiltroTransacao
} from '@/services/financeiroService';
import { 
  buscarDespesas,
  FiltroDespesa
} from '@/services/financeiroDespesasService';

interface UseFinanceiroDataParams {
  typeFilter: string;
  dateRange: { start: Date | null; end: Date | null };
  categoryFilter: string[];
  searchQuery: string;
}

/**
 * Hook personalizado para gerenciar todos os dados financeiros
 */
export const useFinanceiroData = ({ 
  typeFilter, 
  dateRange, 
  categoryFilter, 
  searchQuery 
}: UseFinanceiroDataParams) => {
  const { user } = useAuth();
  
  // Aplicar debounce ao searchQuery para evitar muitas requisições
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  
  // Preparar filtros para a busca de transações
  const getFiltros = (): FiltroTransacao => {
    const filtros: FiltroTransacao = {};
    
    // Remover filtros de tipo para permitir filtros locais mais precisos
    // Apenas aplicar filtro de despesa no backend para otimizar
    if (typeFilter === 'expense') {
      filtros.tipo = 'despesa';
    }
    
    if (dateRange.start) {
      filtros.dataInicio = dateRange.start;
    }
    
    if (dateRange.end) {
      filtros.dataFim = dateRange.end;
    }
    
    if (categoryFilter.length > 0) {
      filtros.categoria = categoryFilter;
    }
    
    // Usar debouncedSearchQuery e só adicionar se tiver pelo menos 1 caractere
    if (debouncedSearchQuery && debouncedSearchQuery.trim().length >= 1) {
      filtros.busca = debouncedSearchQuery.trim();
    }
    
    return filtros;
  };
  
  // Preparar filtros para a busca de despesas específicas
  const getFiltroDespesas = (): FiltroDespesa => {
    const filtros: FiltroDespesa = {};
    if (dateRange.start) filtros.dataInicio = dateRange.start;
    if (dateRange.end) filtros.dataFim = dateRange.end;
    if (categoryFilter.length > 0) filtros.categoria = categoryFilter;
    // Usar debouncedSearchQuery e só adicionar se tiver pelo menos 1 caractere
    if (debouncedSearchQuery && debouncedSearchQuery.trim().length >= 1) {
      filtros.busca = debouncedSearchQuery.trim();
    }
    return filtros;
  };

  // Buscar transações
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['financeiro-transacoes', user?.id, typeFilter, dateRange, categoryFilter, debouncedSearchQuery],
    queryFn: async () => {
      if (!user) return [];
      console.log('[Financeiro] Buscando transações com filtros atuais');
      return await buscarTransacoes(user.id, getFiltros());
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchInterval: 1000 * 60 * 5, // A cada 5 minutos
    refetchOnWindowFocus: true,
    retry: 1, // Reduzir retry para evitar spam
  });
  
  // Buscar resumo financeiro
  const { data: resumoFinanceiro = { totalReceitas: 0, totalDespesas: 0, saldo: 0 }, isLoading: isLoadingResumo } = useQuery({
    queryKey: ['financeiro-resumo', user?.id],
    queryFn: async () => {
      if (!user) return { totalReceitas: 0, totalDespesas: 0, saldo: 0 };
      console.log('[Financeiro] Buscando resumo financeiro das transações regulares');
      // Usar o resumo financeiro sem filtros para mostrar todos os totais
      return await buscarResumoFinanceiro(user.id, {});
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchInterval: 1000 * 60 * 5, // A cada 5 minutos
    refetchOnWindowFocus: true,
  });

  // Buscar despesas específicas (apenas se não filtrar por income ou pending)
  const { data: despesas = [], isLoading: isLoadingDespesas } = useQuery({
    queryKey: ['financeiro-despesas', user?.id, typeFilter, dateRange, categoryFilter, debouncedSearchQuery],
    queryFn: async () => {
      if (!user) return [];
      // Não buscar despesas se filtro for apenas entradas ou a receber
      if (typeFilter === 'income' || typeFilter === 'pending') return [];
      return await buscarDespesas(user.id, getFiltroDespesas());
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchInterval: 1000 * 60 * 5, // A cada 5 minutos
    refetchOnWindowFocus: true,
    retry: 1, // Reduzir retry para evitar spam
  });

  const isLoading = isLoadingTransactions || isLoadingResumo || isLoadingDespesas;

  return {
    transactions,
    resumoFinanceiro,
    despesas,
    isLoading,
    isLoadingTransactions,
    isLoadingResumo,
    isLoadingDespesas
  };
}; 