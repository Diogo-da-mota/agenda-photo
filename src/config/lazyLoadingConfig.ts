/**
 * Configuração centralizada para lazy loading
 * Permite ajustar estratégias de carregamento de forma segura
 */

export interface LazyLoadingConfig {
  // Configurações gerais
  enabled: boolean;
  preloadEnabled: boolean;
  errorBoundaryEnabled: boolean;
  
  // Timeouts e delays
  loadingTimeout: number;
  preloadDelay: number;
  retryDelay: number;
  
  // Estratégias por tipo de conexão
  connectionStrategies: {
    slow: ConnectionStrategy;
    medium: ConnectionStrategy;
    fast: ConnectionStrategy;
    unknown: ConnectionStrategy;
  };
  
  // Componentes prioritários (sempre precarregados)
  priorityComponents: string[];
  
  // Componentes que nunca devem ser precarregados
  excludeFromPreload: string[];
  
  // Configurações de monitoramento
  monitoring: {
    enabled: boolean;
    logPerformance: boolean;
    trackErrors: boolean;
  };
}

export interface ConnectionStrategy {
  preloadEnabled: boolean;
  maxConcurrentLoads: number;
  chunkSize: 'minimal' | 'medium' | 'full';
  priorityOnly: boolean;
  retryAttempts: number;
}

// Configuração padrão
export const defaultLazyLoadingConfig: LazyLoadingConfig = {
  enabled: true,
  preloadEnabled: true,
  errorBoundaryEnabled: true,
  
  loadingTimeout: 10000, // 10 segundos
  preloadDelay: 1000, // 1 segundo
  retryDelay: 2000, // 2 segundos
  
  connectionStrategies: {
    slow: {
      preloadEnabled: false,
      maxConcurrentLoads: 1,
      chunkSize: 'minimal',
      priorityOnly: true,
      retryAttempts: 1
    },
    medium: {
      preloadEnabled: true,
      maxConcurrentLoads: 2,
      chunkSize: 'medium',
      priorityOnly: false,
      retryAttempts: 2
    },
    fast: {
      preloadEnabled: true,
      maxConcurrentLoads: 4,
      chunkSize: 'full',
      priorityOnly: false,
      retryAttempts: 3
    },
    unknown: {
      preloadEnabled: true,
      maxConcurrentLoads: 2,
      chunkSize: 'medium',
      priorityOnly: false,
      retryAttempts: 2
    }
  },
  
  priorityComponents: [
    'Dashboard',
    'Clientes',
    'Agenda'
  ],
  
  excludeFromPreload: [
    'Testes',
    'DiagnosticoSupabase',
    'SupabaseUploadTest'
  ],
  
  monitoring: {
    enabled: process.env.NODE_ENV === 'development',
    logPerformance: true,
    trackErrors: true
  }
};

// Configuração para produção (mais conservadora)
export const productionLazyLoadingConfig: LazyLoadingConfig = {
  ...defaultLazyLoadingConfig,
  preloadDelay: 2000, // Mais conservador em produção
  
  connectionStrategies: {
    ...defaultLazyLoadingConfig.connectionStrategies,
    unknown: {
      preloadEnabled: false, // Mais conservador para conexões desconhecidas
      maxConcurrentLoads: 1,
      chunkSize: 'minimal',
      priorityOnly: true,
      retryAttempts: 1
    }
  },
  
  monitoring: {
    enabled: false,
    logPerformance: false,
    trackErrors: true // Mantém tracking de erros em produção
  }
};

// Configuração para desenvolvimento (mais agressiva)
export const developmentLazyLoadingConfig: LazyLoadingConfig = {
  ...defaultLazyLoadingConfig,
  preloadDelay: 500, // Mais rápido em desenvolvimento
  
  connectionStrategies: {
    ...defaultLazyLoadingConfig.connectionStrategies,
    unknown: {
      preloadEnabled: true,
      maxConcurrentLoads: 3,
      chunkSize: 'full',
      priorityOnly: false,
      retryAttempts: 3
    }
  },
  
  monitoring: {
    enabled: true,
    logPerformance: true,
    trackErrors: true
  }
};

/**
 * Retorna a configuração apropriada baseada no ambiente
 */
export const getLazyLoadingConfig = (): LazyLoadingConfig => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return productionLazyLoadingConfig;
    case 'development':
      return developmentLazyLoadingConfig;
    default:
      return defaultLazyLoadingConfig;
  }
};

/**
 * Valida se um componente deve ser precarregado
 */
export const shouldPreloadComponent = (
  componentName: string, 
  connectionSpeed: string,
  config: LazyLoadingConfig = getLazyLoadingConfig()
): boolean => {
  // Verifica se está na lista de exclusão
  if (config.excludeFromPreload.includes(componentName)) {
    return false;
  }
  
  // Componentes prioritários sempre são precarregados (se preload estiver habilitado)
  if (config.priorityComponents.includes(componentName)) {
    return config.preloadEnabled;
  }
  
  // Verifica estratégia baseada na conexão
  const strategy = config.connectionStrategies[connectionSpeed as keyof typeof config.connectionStrategies] 
    || config.connectionStrategies.unknown;
  
  return strategy.preloadEnabled && !strategy.priorityOnly;
};

/**
 * Retorna a estratégia de conexão apropriada
 */
export const getConnectionStrategy = (
  connectionSpeed: string,
  config: LazyLoadingConfig = getLazyLoadingConfig()
): ConnectionStrategy => {
  return config.connectionStrategies[connectionSpeed as keyof typeof config.connectionStrategies] 
    || config.connectionStrategies.unknown;
};