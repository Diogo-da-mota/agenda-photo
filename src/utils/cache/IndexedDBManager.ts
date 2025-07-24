/**
 * Sistema de cache IndexedDB para dados estruturados
 * Permite funcionalidade offline completa sem alterar funcionalidades existentes
 */

export interface CacheConfig {
  dbName: string;
  version: number;
  stores: CacheStore[];
}

export interface CacheStore {
  name: string;
  keyPath: string;
  indexes?: CacheIndex[];
  autoIncrement?: boolean;
}

export interface CacheIndex {
  name: string;
  keyPath: string;
  unique?: boolean;
}

export interface CacheItem<T = any> {
  id: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
  userId?: string;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private config: CacheConfig;
  private isReady = false;
  private readyPromise: Promise<void>;

  constructor(config: CacheConfig) {
    this.config = config;
    this.readyPromise = this.initialize();
  }

  /**
   * Inicializar IndexedDB
   */
  private async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isReady = true;
        console.log('✅ IndexedDB inicializado:', this.config.dbName);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Criar stores
        this.config.stores.forEach(store => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, {
              keyPath: store.keyPath,
              autoIncrement: store.autoIncrement || false
            });

            // Criar indexes
            if (store.indexes) {
              store.indexes.forEach(index => {
                objectStore.createIndex(index.name, index.keyPath, {
                  unique: index.unique || false
                });
              });
            }
          }
        });
      };
    });
  }

  /**
   * Aguardar inicialização
   */
  async waitForReady(): Promise<void> {
    if (!this.isReady) {
      await this.readyPromise;
    }
  }

  /**
   * Salvar item no cache
   */
  async setItem<T>(
    storeName: string, 
    key: string, 
    data: T, 
    expiresInMs?: number,
    userId?: string
  ): Promise<void> {
    await this.waitForReady();
    
    if (!this.db) {
      throw new Error('IndexedDB não está inicializado');
    }

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const cacheItem: CacheItem<T> = {
      id: key,
      data,
      timestamp: Date.now(),
      expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined,
      userId
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheItem);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obter item do cache
   */
  async getItem<T>(storeName: string, key: string): Promise<T | null> {
    await this.waitForReady();
    
    if (!this.db) {
      return null;
    }

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result as CacheItem<T>;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Verificar se expirou
        if (result.expiresAt && Date.now() > result.expiresAt) {
          this.removeItem(storeName, key); // Remove item expirado
          resolve(null);
          return;
        }

        resolve(result.data);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remover item do cache
   */
  async removeItem(storeName: string, key: string): Promise<void> {
    await this.waitForReady();
    
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obter todos os itens de um store
   */
  async getAllItems<T>(storeName: string, userId?: string): Promise<T[]> {
    await this.waitForReady();
    
    if (!this.db) {
      return [];
    }

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result as CacheItem<T>[];
        const now = Date.now();
        
        const validItems = results
          .filter(item => {
            // Filtrar por usuário se especificado
            if (userId && item.userId !== userId) {
              return false;
            }
            
            // Filtrar itens expirados
            if (item.expiresAt && now > item.expiresAt) {
              this.removeItem(storeName, item.id); // Remove item expirado
              return false;
            }
            
            return true;
          })
          .map(item => item.data);
        
        resolve(validItems);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpar store específico
   */
  async clearStore(storeName: string): Promise<void> {
    await this.waitForReady();
    
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obter tamanho do cache
   */
  async getCacheSize(): Promise<{ [storeName: string]: number }> {
    await this.waitForReady();
    
    if (!this.db) {
      return {};
    }

    const sizes: { [storeName: string]: number } = {};

    for (const store of this.config.stores) {
      const transaction = this.db.transaction([store.name], 'readonly');
      const objectStore = transaction.objectStore(store.name);
      
      sizes[store.name] = await new Promise((resolve, reject) => {
        const request = objectStore.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    return sizes;
  }

  /**
   * Limpar itens expirados
   */
  async cleanExpiredItems(): Promise<number> {
    await this.waitForReady();
    
    if (!this.db) {
      return 0;
    }

    let cleanedCount = 0;
    const now = Date.now();

    for (const storeConfig of this.config.stores) {
      const transaction = this.db.transaction([storeConfig.name], 'readwrite');
      const store = transaction.objectStore(storeConfig.name);
      
      const request = store.getAll();
      
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          const items = request.result as CacheItem[];
          
          items.forEach(item => {
            if (item.expiresAt && now > item.expiresAt) {
              store.delete(item.id);
              cleanedCount++;
            }
          });
          
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    }

    return cleanedCount;
  }

  /**
   * Verificar se um item existe
   */
  async hasItem(storeName: string, key: string): Promise<boolean> {
    const item = await this.getItem(storeName, key);
    return item !== null;
  }

  /**
   * Atualizar timestamp de um item (renovar)
   */
  async touchItem(storeName: string, key: string): Promise<void> {
    const item = await this.getItem(storeName, key);
    if (item) {
      await this.setItem(storeName, key, item);
    }
  }

  /**
   * Fechar conexão
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isReady = false;
    }
  }
}

// Configuração padrão para o sistema
const defaultConfig: CacheConfig = {
  dbName: 'BrightSparkCache',
  version: 1,
  stores: [
    {
      name: 'financeiro_transacoes',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'timestamp', keyPath: 'timestamp' }
      ]
    },
    {
      name: 'financeiro_categorias',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' }
      ]
    },
    {
      name: 'agenda_eventos',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'data_evento', keyPath: 'data_evento' }
      ]
    },
    {
      name: 'clientes',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'email', keyPath: 'email', unique: true }
      ]
    },
    {
      name: 'portfolio_trabalhos',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'created_at', keyPath: 'created_at' }
      ]
    },
    {
      name: 'usuarios_config',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId' }
      ]
    }
  ]
};

// Instância singleton
export const indexedDBManager = new IndexedDBManager(defaultConfig);

// Hook para React
export function useIndexedDBCache() {
  return {
    setItem: indexedDBManager.setItem.bind(indexedDBManager),
    getItem: indexedDBManager.getItem.bind(indexedDBManager),
    removeItem: indexedDBManager.removeItem.bind(indexedDBManager),
    getAllItems: indexedDBManager.getAllItems.bind(indexedDBManager),
    clearStore: indexedDBManager.clearStore.bind(indexedDBManager),
    hasItem: indexedDBManager.hasItem.bind(indexedDBManager),
    getCacheSize: indexedDBManager.getCacheSize.bind(indexedDBManager),
    cleanExpiredItems: indexedDBManager.cleanExpiredItems.bind(indexedDBManager)
  };
}

export default IndexedDBManager; 