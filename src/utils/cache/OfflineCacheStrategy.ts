/**
 * Estratégia de cache offline que intercepta consultas sem alterar funcionalidades
 * Funciona como uma camada transparente sobre as consultas existentes
 */

import { indexedDBManager } from './IndexedDBManager';

export interface CacheStrategy {
  key: string;
  storeName: string;
  ttl?: number; // Time to live em milissegundos
  userId?: string;
}

export interface QueryResult<T = any> {
  data: T;
  fromCache: boolean;
  timestamp: number;
}

class OfflineCacheStrategy {
  private isOnline = navigator.onLine;
  private syncQueue: Array<{ action: string; data: any; timestamp: number }> = [];

  constructor() {
    // Monitorar status online/offline
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Interceptar e cachear uma consulta
   * Funciona como wrapper transparente sobre consultas existentes
   */
  async cacheQuery<T>(
    queryFn: () => Promise<T>,
    strategy: CacheStrategy
  ): Promise<QueryResult<T>> {
    const cacheKey = this.generateCacheKey(strategy);

    try {
      // 1. Tentar obter do cache primeiro
      const cachedData = await indexedDBManager.getItem<T>(
        strategy.storeName,
        cacheKey
      );

      // 2. Se offline e tem cache, retornar cache
      if (!this.isOnline && cachedData) {
        return {
          data: cachedData,
          fromCache: true,
          timestamp: Date.now()
        };
      }

      // 3. Se online, tentar consulta real
      if (this.isOnline) {
        try {
          const freshData = await queryFn();
          
          // Salvar no cache para uso futuro
          await indexedDBManager.setItem(
            strategy.storeName,
            cacheKey,
            freshData,
            strategy.ttl,
            strategy.userId
          );

          return {
            data: freshData,
            fromCache: false,
            timestamp: Date.now()
          };
        } catch (error) {
          // Erro na consulta online, usar cache se disponível
          if (cachedData) {
            console.warn('Consulta online falhou, usando cache:', error);
            return {
              data: cachedData,
              fromCache: true,
              timestamp: Date.now()
            };
          }
          throw error;
        }
      }

      // 4. Se offline e sem cache, retornar erro específico
      if (cachedData) {
        return {
          data: cachedData,
          fromCache: true,
          timestamp: Date.now()
        };
      }

      throw new Error('Dados não disponíveis offline');
    } catch (error) {
      console.error('Erro na estratégia de cache:', error);
      throw error;
    }
  }

  /**
   * Invalidar cache específico
   */
  async invalidateCache(strategy: CacheStrategy): Promise<void> {
    const cacheKey = this.generateCacheKey(strategy);
    await indexedDBManager.removeItem(strategy.storeName, cacheKey);
  }

  /**
   * Invalidar todo o cache de um usuário
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const stores = [
      'financeiro_transacoes',
      'financeiro_categorias', 
      'agenda_eventos',
      'clientes',
      'portfolio_trabalhos',
      'usuarios_config'
    ];

    for (const storeName of stores) {
      const items = await indexedDBManager.getAllItems(storeName, userId);
      for (const item of items) {
        await indexedDBManager.removeItem(storeName, (item as any).id);
      }
    }
  }

  /**
   * Adicionar ação à fila de sincronização
   */
  addToSyncQueue(action: string, data: any): void {
    this.syncQueue.push({
      action,
      data,
      timestamp: Date.now()
    });

    // Limitar tamanho da fila
    if (this.syncQueue.length > 100) {
      this.syncQueue = this.syncQueue.slice(-100);
    }
  }

  /**
   * Processar fila de sincronização quando voltar online
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`Processando ${this.syncQueue.length} itens da fila de sincronização...`);

    const processedItems: any[] = [];

    for (const item of this.syncQueue) {
      try {
        // Aqui você pode implementar a lógica específica de sincronização
        // Por exemplo, reenviar transações, eventos, etc.
        await this.syncItem(item);
        processedItems.push(item);
      } catch (error) {
        console.error('Erro ao sincronizar item:', error);
        // Manter item na fila para tentar novamente
      }
    }

    // Remover itens processados da fila
    this.syncQueue = this.syncQueue.filter(
      item => !processedItems.includes(item)
    );
  }

  /**
   * Sincronizar um item específico
   */
  private async syncItem(item: any): Promise<void> {
    // Esta função pode ser estendida para implementar
    // lógicas específicas de sincronização
    console.log('Sincronizando item:', item.action, item.data);
  }

  /**
   * Obter estatísticas do cache
   */
  async getCacheStats(): Promise<{
    totalItems: number;
    cacheSize: { [storeName: string]: number };
    syncQueueSize: number;
    isOnline: boolean;
  }> {
    const cacheSize = await indexedDBManager.getCacheSize();
    const totalItems = Object.values(cacheSize).reduce((sum, count) => sum + count, 0);

    return {
      totalItems,
      cacheSize,
      syncQueueSize: this.syncQueue.length,
      isOnline: this.isOnline
    };
  }

  /**
   * Limpar cache expirado
   */
  async cleanExpiredCache(): Promise<number> {
    return await indexedDBManager.cleanExpiredItems();
  }

  /**
   * Gerar chave de cache única
   */
  private generateCacheKey(strategy: CacheStrategy): string {
    const parts = [strategy.key];
    
    if (strategy.userId) {
      parts.push(`user:${strategy.userId}`);
    }
    
    return parts.join('|');
  }

  /**
   * Verificar se está online
   */
  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Forçar sincronização
   */
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }
}

// Instância singleton
export const offlineCacheStrategy = new OfflineCacheStrategy();

/**
 * Hook para usar cache offline em componentes React
 */
export function useOfflineCache() {
  return {
    cacheQuery: offlineCacheStrategy.cacheQuery.bind(offlineCacheStrategy),
    invalidateCache: offlineCacheStrategy.invalidateCache.bind(offlineCacheStrategy),
    invalidateUserCache: offlineCacheStrategy.invalidateUserCache.bind(offlineCacheStrategy),
    addToSyncQueue: offlineCacheStrategy.addToSyncQueue.bind(offlineCacheStrategy),
    getCacheStats: offlineCacheStrategy.getCacheStats.bind(offlineCacheStrategy),
    cleanExpiredCache: offlineCacheStrategy.cleanExpiredCache.bind(offlineCacheStrategy),
    isOnline: offlineCacheStrategy.isNetworkOnline.bind(offlineCacheStrategy),
    forceSync: offlineCacheStrategy.forcSync.bind(offlineCacheStrategy)
  };
}

/**
 * Wrapper para queries do React Query com cache offline
 */
export function withOfflineCache<T>(
  queryFn: () => Promise<T>,
  strategy: CacheStrategy
) {
  return async (): Promise<T> => {
    const result = await offlineCacheStrategy.cacheQuery(queryFn, strategy);
    return result.data;
  };
}

export default OfflineCacheStrategy; 