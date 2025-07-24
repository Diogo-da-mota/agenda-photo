/**
 * Configurações do Background Sync
 * Centralizadas para facilitar manutenção e customização
 */

export const BACKGROUND_SYNC_CONFIG = {
  // Configurações gerais
  enabled: true,
  autoSync: true,
  
  // Intervalos de tempo (em milissegundos)
  syncInterval: 30000,     // 30 segundos - intervalo entre sincronizações automáticas
  retryDelay: 5000,        // 5 segundos - delay entre tentativas de retry
  autoSaveDelay: 2000,     // 2 segundos - delay para auto-save
  
  // Limites
  maxRetries: 3,           // Máximo de tentativas para uma operação
  maxPendingOps: 100,      // Máximo de operações pendentes
  maxOfflineTime: 86400000, // 24 horas - tempo máximo para manter dados offline
  
  // Tags de sincronização
  syncTags: {
    PENDING_OPERATIONS: 'background-sync-operations',
    OFFLINE_DATA: 'background-sync-offline-data',
    AUTO_SAVE: 'background-sync-auto-save',
    MANUAL_SYNC: 'background-sync-manual'
  },
  
  // Configurações por tabela
  tableConfigs: {
    clientes: {
      priority: 'high',
      autoSync: true,
      retryCount: 3,
      conflictResolution: 'server-wins' // ou 'client-wins', 'merge'
    },
    agenda_eventos: {
      priority: 'high',
      autoSync: true,
      retryCount: 3,
      conflictResolution: 'server-wins'
    },
    contratos: {
      priority: 'medium',
      autoSync: true,
      retryCount: 2,
      conflictResolution: 'server-wins'
    },
    financeiro_transacoes: {
      priority: 'high',
      autoSync: true,
      retryCount: 3,
      conflictResolution: 'server-wins'
    },
    portfolio_trabalhos: {
      priority: 'low',
      autoSync: false, // Sync manual para uploads grandes
      retryCount: 1,
      conflictResolution: 'client-wins'
    },
    configuracoes_empresa: {
      priority: 'medium',
      autoSync: true,
      retryCount: 2,
      conflictResolution: 'server-wins'
    }
  },
  
  // Configurações de IndexedDB
  indexedDB: {
    name: 'BrightSparkOfflineDB',
    version: 1,
    stores: {
      operations: {
        keyPath: 'id',
        indexes: ['type', 'timestamp', 'tableName', 'priority']
      },
      offlineData: {
        keyPath: 'id',
        indexes: ['type', 'timestamp', 'tableName']
      },
      autoSave: {
        keyPath: 'id',
        indexes: ['type', 'timestamp', 'tableName']
      },
      syncLog: {
        keyPath: 'id',
        indexes: ['timestamp', 'status', 'operation']
      }
    }
  },
  
  // Configurações de notificação
  notifications: {
    showOfflineStatus: true,
    showSyncStatus: true,
    showConflicts: true,
    showErrors: true,
    position: 'bottom-right' // ou 'top-right', 'top-left', 'bottom-left'
  },
  
  // Configurações de debug
  debug: {
    enabled: import.meta.env.DEV,
    logLevel: 'info', // 'error', 'warn', 'info', 'debug'
    logOperations: true,
    logSyncEvents: true,
    logConflicts: true
  },
  
  // Configurações de conflito
  conflictResolution: {
    defaultStrategy: 'server-wins',  // ou 'client-wins', 'merge', 'prompt-user'
    
    // Estratégias específicas por tipo de conflito
    strategies: {
      'server-wins': {
        description: 'Servidor sempre vence em conflitos',
        action: 'overwrite-local'
      },
      'client-wins': {
        description: 'Cliente sempre vence em conflitos',
        action: 'overwrite-server'
      },
      'merge': {
        description: 'Tentar mesclar mudanças quando possível',
        action: 'merge-changes'
      },
      'prompt-user': {
        description: 'Perguntar ao usuário como resolver',
        action: 'show-dialog'
      }
    }
  },
  
  // Configurações de cache
  cache: {
    enabled: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    ttl: 24 * 60 * 60 * 1000,  // 24 horas
    compression: true,
    
    // Prioridades de cache
    priorities: {
      user_data: 'high',
      app_data: 'medium',
      static_data: 'low'
    }
  },
  
  // Configurações de backup
  backup: {
    enabled: true,
    frequency: 'daily', // 'hourly', 'daily', 'weekly'
    retention: 7,       // dias
    compressionLevel: 6 // 1-9, onde 9 é máxima compressão
  }
};

// Função para obter configuração específica de uma tabela
export const getTableConfig = (tableName: string) => {
  return BACKGROUND_SYNC_CONFIG.tableConfigs[tableName as keyof typeof BACKGROUND_SYNC_CONFIG.tableConfigs] || {
    priority: 'medium',
    autoSync: true,
    retryCount: 2,
    conflictResolution: 'server-wins'
  };
};

// Função para verificar se uma funcionalidade está habilitada
export const isFeatureEnabled = (feature: string): boolean => {
  switch (feature) {
    case 'backgroundSync':
      return BACKGROUND_SYNC_CONFIG.enabled;
    case 'autoSync':
      return BACKGROUND_SYNC_CONFIG.autoSync;
    case 'notifications':
      return BACKGROUND_SYNC_CONFIG.notifications.showSyncStatus;
    case 'debug':
      return BACKGROUND_SYNC_CONFIG.debug.enabled;
    case 'cache':
      return BACKGROUND_SYNC_CONFIG.cache.enabled;
    case 'backup':
      return BACKGROUND_SYNC_CONFIG.backup.enabled;
    default:
      return false;
  }
};

// Função para obter configuração de prioridade
export const getPriorityConfig = (priority: 'high' | 'medium' | 'low') => {
  const configs = {
    high: {
      syncInterval: 10000,  // 10 segundos
      retryCount: 3,
      timeout: 30000       // 30 segundos
    },
    medium: {
      syncInterval: 30000,  // 30 segundos
      retryCount: 2,
      timeout: 20000       // 20 segundos
    },
    low: {
      syncInterval: 60000,  // 1 minuto
      retryCount: 1,
      timeout: 10000       // 10 segundos
    }
  };
  
  return configs[priority];
};
