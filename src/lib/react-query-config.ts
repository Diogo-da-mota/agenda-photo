/**
 * Configuração otimizada do React Query para performance
 * Reduz consultas desnecessárias e melhora experiência do usuário
 * Cache longo com invalidação automática após operações CRUD
 */
import { QueryClient } from '@tanstack/react-query';

/**
 * Função dinâmica para obter as opções padrão do React Query.
 * Aplica um cache mais agressivo em dispositivos móveis.
 */
const getDefaultQueryOptions = (isMobile: boolean) => {
  // Em dispositivos móveis, o cache é mais longo para melhorar a performance percebida
  // e reduzir o consumo de dados, já que a conexão pode ser instável.
  const staleTime = isMobile ? 1000 * 60 * 10 : 1000 * 60 * 5; // Mobile: 10 min, Desktop: 5 min
  const gcTime = isMobile ? 1000 * 60 * 20 : 1000 * 60 * 10;   // Mobile: 20 min, Desktop: 10 min

  return {
    queries: {
      staleTime,
      gcTime,
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
};

/**
 * O QueryClient agora é uma função que usa o hook para aplicar
 * as configurações corretas baseadas no dispositivo.
 * 
 * NOTA: Esta abordagem não funciona diretamente na inicialização do QueryClient,
 * pois hooks só podem ser chamados dentro de componentes React.
 * A lógica será aplicada em um wrapper ou diretamente nos hooks de query.
 * 
 * CORREÇÃO: A melhor abordagem é criar uma função que retorne a configuração,
 * mas o QueryClient deve ser instanciado fora do escopo de um componente.
 * Vamos ajustar a abordagem para usar essa função em um ponto central da aplicação.
 * 
 * A inicialização do QueryClient será ajustada para que as defaultOptions
 * possam ser dinâmicas.
 */
export const createQueryClient = (isMobile: boolean) => new QueryClient({
  defaultOptions: getDefaultQueryOptions(isMobile),
});


// A instância global do queryClient será criada no App.tsx, onde o hook pode ser usado.
// Por enquanto, exportamos um cliente padrão para ser usado em contextos não-React.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache mais longo para reduzir consultas
      staleTime: 1000 * 60 * 5, // 5 minutos - dados considerados frescos
      gcTime: 1000 * 60 * 10, // 10 minutos - tempo em cache
      
      // ✅ CORREÇÃO: Configurações mais conservadoras para evitar refetch excessivo
      refetchOnWindowFocus: false, // Não recarregar ao focar janela (evita conflitos)
      refetchOnMount: true, // Recarregar ao montar componente apenas se dados estão stale
      refetchOnReconnect: true, // Recarregar ao reconectar internet
      
      // Retry mais conservador
      retry: 2, // Máximo 2 tentativas
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry apenas uma vez para mutations
      retry: 1,
      // ✅ 3. Handler de erro global para mutações
      onError: (error: any) => {
        // Futuramente, poderíamos usar um sistema de toasts aqui
        console.error("Ocorreu um erro em uma mutação:", error.message);
      }
    },
  },
});

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