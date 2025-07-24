/**
 * Configuração otimizada do React Query para performance
 * Reduz consultas desnecessárias e melhora experiência do usuário
 * Cache longo com invalidação automática após operações CRUD
 */
import { QueryClient } from '@tanstack/react-query';

/**
 * Configuração padrão simplificada para evitar problemas de hidratação
 */
const defaultQueryOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    retry: 1,
    onError: (error: any) => {
      console.error("Ocorreu um erro em uma mutação:", error.message);
    },
  },
};

/**
 * Função para criar QueryClient com configuração otimizada
 */
export const createQueryClient = () => new QueryClient({
  defaultOptions: defaultQueryOptions,
});

// Instância global do queryClient
export const queryClient = createQueryClient();

/**
 * Configurações específicas por tipo de dados com invalidação automática
 */
export const queryConfigs = {
  // Dados financeiros - críticos para sincronização entre usuários
  financeiro: {
    staleTime: 1000 * 60 * 5, // 5 minutos - cache longo
    gcTime: 1000 * 60 * 15, // 15 minutos
    refetchOnWindowFocus: false, // CORRIGIDO: Desabilitado para evitar requisições excessivas.
  },
  
  // Agenda/Eventos - dados que mudam frequentemente
  agenda: {
    staleTime: 1000 * 60 * 3, // 3 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false, // CORRIGIDO: Desabilitado para evitar requisições excessivas.
  },
  
  // Portfolio - dados que mudam raramente
  portfolio: {
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchOnWindowFocus: false, // Não crítico para sincronização
  },
  
  // Configurações - dados que quase nunca mudam
  configuracoes: {
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
    refetchOnWindowFocus: false, // Não crítico para sincronização
  },
  
  // Dados em tempo real - para quando precisar de atualizações frequentes
  realtime: {
    staleTime: 1000 * 30, // 30 segundos
    gcTime: 1000 * 60 * 2, // 2 minutos
  },
};

/**
 * Chaves de cache organizadas por categoria para invalidação inteligente
 */
export const CACHE_KEYS = {
  // Financeiro - todas as queries relacionadas a dados financeiros
  FINANCEIRO: {
    TRANSACOES: 'financeiro-transacoes',
    RESUMO: 'financeiro-resumo',
    DESPESAS: 'financeiro-despesas',
    ENTRADAS: 'financeiro-entradas',
    RESTANTES: 'financeiro-valores-restantes',
  },
  
  // Agenda - todas as queries relacionadas a eventos
  AGENDA: {
    EVENTOS: 'agenda-eventos',
    CALENDARIO: 'agenda-calendario',
    DATAS_COM_EVENTOS: 'agenda-datas-eventos',
    PROXIMOS_EVENTOS: 'agenda-proximos-eventos',
    CONTAGEM_EVENTOS: 'agenda-contagem-eventos',
  },
  
  // Portfolio - dados de portfólio
  PORTFOLIO: {
    TRABALHOS: 'portfolio-trabalhos',
    TRABALHO_INDIVIDUAL: 'portfolio-trabalho-individual',
    CATEGORIAS: 'portfolio-categorias',
  },
  
  // Configurações - dados de configuração
  CONFIGURACOES: {
    EMPRESA: 'configuracoes-empresa',
    USUARIO: 'configuracoes-usuario',
    SISTEMA: 'configuracoes-sistema',
  },
} as const;

/**
 * Função para invalidar cache por categoria
 * Garante que todas as queries relacionadas sejam invalidadas
 */
export const invalidateCategory = (category: keyof typeof CACHE_KEYS) => {
  try {
    const keys = Object.values(CACHE_KEYS[category]);
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  } catch (error) {
    console.warn('[Cache] Erro ao invalidar categoria:', category, error);
  }
};

/**
 * Função para invalidar cache específico de dados financeiros
 * Usada após operações CRUD em eventos ou transações
 */
export const invalidateFinanceiroCache = (userId?: string) => {
  try {
    // Invalidar todas as queries financeiras
    Object.values(CACHE_KEYS.FINANCEIRO).forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [key, userId] });
      }
    });
    
    console.log('[Cache] Cache financeiro invalidado para sincronização');
  } catch (error) {
    console.warn('[Cache] Erro ao invalidar cache financeiro:', error);
  }
};

/**
 * Função para invalidar cache específico de dados da agenda
 * Usada após operações CRUD em eventos
 */
export const invalidateAgendaCache = (userId?: string) => {
  try {
    // Invalidar todas as queries da agenda
    Object.values(CACHE_KEYS.AGENDA).forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [key, userId] });
      }
    });
    
    console.log('[Cache] Cache da agenda invalidado para sincronização');
  } catch (error) {
    console.warn('[Cache] Erro ao invalidar cache da agenda:', error);
  }
};

/**
 * Função para invalidação automática após operações CRUD
 * Mantém dados sempre atualizados entre usuários
 */
export const invalidateAfterCRUD = (
  operation: 'create' | 'update' | 'delete',
  dataType: 'evento' | 'transacao' | 'portfolio' | 'configuracao',
  userId?: string
) => {
  try {
    console.log(`[Cache] Invalidando cache após ${operation} de ${dataType}`);
    
    switch (dataType) {
      case 'evento':
        // Eventos afetam tanto agenda quanto financeiro
        invalidateAgendaCache(userId);
        invalidateFinanceiroCache(userId);
        break;
        
      case 'transacao':
        // Transações afetam apenas financeiro
        invalidateFinanceiroCache(userId);
        break;
        
      case 'portfolio':
        // Portfolio afeta apenas dados de portfólio
        invalidateCategory('PORTFOLIO');
        break;
        
      case 'configuracao':
        // Configurações afetam apenas dados de configuração
        invalidateCategory('CONFIGURACOES');
        break;
    }
  } catch (error) {
    console.warn('[Cache] Erro ao invalidar cache após CRUD:', error);
  }
};

/**
 * ✅ FUNÇÃO DE FALLBACK SEGURO - Previne quebras do site
 * Use esta função quando não tiver certeza sobre as query keys
 */
export const safeInvalidateQueries = (queryKey: unknown[], userId?: string) => {
  try {
    if (!Array.isArray(queryKey) || queryKey.length === 0) {
      console.warn('[Cache] Query key inválida:', queryKey);
      return;
    }
    
    queryClient.invalidateQueries({ queryKey });
    
    // Se userId foi fornecido, tentar também com userId
    if (userId) {
      queryClient.invalidateQueries({ queryKey: [...queryKey, userId] });
    }
    
    console.log('[Cache] Invalidação segura executada para:', queryKey);
  } catch (error) {
    console.warn('[Cache] Erro na invalidação segura:', error);
    // Não throw error - site continua funcionando
  }
};