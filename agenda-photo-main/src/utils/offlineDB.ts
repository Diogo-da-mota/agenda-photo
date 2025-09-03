import { BACKGROUND_SYNC_CONFIG } from '@/config/backgroundSync';

interface OfflineOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  tableName: string;
  data: any;
  endpoint?: string;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

interface OfflineData {
  id: string;
  type: string;
  tableName: string;
  payload: any;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  timestamp: number;
}

interface AutoSaveData {
  id: string;
  type: string;
  tableName: string;
  payload: any;
  endpoint: string;
  auth: string;
  timestamp: number;
}

interface SyncLogEntry {
  id: string;
  operation: string;
  tableName: string;
  status: 'success' | 'error' | 'pending';
  timestamp: number;
  error?: string;
  duration?: number;
}

/**
 * Utilitário para gerenciar IndexedDB do Background Sync
 * Centraliza todas as operações de banco de dados offline
 */
class OfflineDBManager {
  private db: IDBDatabase | null = null;
  private readonly dbName = BACKGROUND_SYNC_CONFIG.indexedDB.name;
  private readonly dbVersion = BACKGROUND_SYNC_CONFIG.indexedDB.version;

  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[OfflineDB] Erro ao abrir banco:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineDB] Banco aberto com sucesso');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  private createStores(db: IDBDatabase): void {
    const { stores } = BACKGROUND_SYNC_CONFIG.indexedDB;

    // Store de operações
    if (!db.objectStoreNames.contains('operations')) {
      const operationsStore = db.createObjectStore('operations', { 
        keyPath: stores.operations.keyPath 
      });
      
      stores.operations.indexes.forEach(index => {
        operationsStore.createIndex(index, index);
      });
    }

    // Store de dados offline
    if (!db.objectStoreNames.contains('offlineData')) {
      const offlineStore = db.createObjectStore('offlineData', { 
        keyPath: stores.offlineData.keyPath 
      });
      
      stores.offlineData.indexes.forEach(index => {
        offlineStore.createIndex(index, index);
      });
    }

    // Store de auto-save
    if (!db.objectStoreNames.contains('autoSave')) {
      const autoSaveStore = db.createObjectStore('autoSave', { 
        keyPath: stores.autoSave.keyPath 
      });
      
      stores.autoSave.indexes.forEach(index => {
        autoSaveStore.createIndex(index, index);
      });
    }

    // Store de log de sincronização
    if (!db.objectStoreNames.contains('syncLog')) {
      const syncLogStore = db.createObjectStore('syncLog', { 
        keyPath: stores.syncLog.keyPath 
      });
      
      stores.syncLog.indexes.forEach(index => {
        syncLogStore.createIndex(index, index);
      });
    }

    console.log('[OfflineDB] Stores criados com sucesso');
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
  }

  // ===== OPERAÇÕES =====

  async addOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> {
    await this.ensureInitialized();
    
    const fullOperation: OfflineOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      
      const request = store.add(fullOperation);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[OfflineDB] Operação adicionada:', fullOperation.id);
        resolve(fullOperation.id);
      };
    });
  }

  async getOperations(filter?: { status?: string; tableName?: string; priority?: string }): Promise<OfflineOperation[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readonly');
      const store = transaction.objectStore('operations');
      
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let operations = request.result;
        
        // Aplicar filtros se fornecidos
        if (filter) {
          operations = operations.filter(op => {
            if (filter.status && op.status !== filter.status) return false;
            if (filter.tableName && op.tableName !== filter.tableName) return false;
            if (filter.priority && op.priority !== filter.priority) return false;
            return true;
          });
        }
        
        resolve(operations);
      };
    });
  }

  async updateOperation(id: string, updates: Partial<OfflineOperation>): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      
      const getRequest = store.get(id);
      getRequest.onerror = () => reject(getRequest.error);
      
      getRequest.onsuccess = () => {
        const operation = getRequest.result;
        if (!operation) {
          reject(new Error('Operação não encontrada'));
          return;
        }
        
        const updatedOperation = { ...operation, ...updates };
        const putRequest = store.put(updatedOperation);
        
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
    });
  }

  async removeOperation(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[OfflineDB] Operação removida:', id);
        resolve();
      };
    });
  }

  async clearOperations(filter?: { status?: string; olderThan?: number }): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const operations = request.result;
        let toDelete = operations;
        
        // Aplicar filtros
        if (filter) {
          toDelete = operations.filter(op => {
            if (filter.status && op.status !== filter.status) return false;
            if (filter.olderThan && op.timestamp > filter.olderThan) return false;
            return true;
          });
        }
        
        // Deletar operações
        let deletedCount = 0;
        const deletePromises = toDelete.map(op => {
          return new Promise<void>((deleteResolve, deleteReject) => {
            const deleteRequest = store.delete(op.id);
            deleteRequest.onerror = () => deleteReject(deleteRequest.error);
            deleteRequest.onsuccess = () => {
              deletedCount++;
              deleteResolve();
            };
          });
        });
        
        Promise.all(deletePromises)
          .then(() => {
            console.log('[OfflineDB] Operações limpas:', deletedCount);
            resolve(deletedCount);
          })
          .catch(reject);
      };
    });
  }

  // ===== DADOS OFFLINE =====

  async addOfflineData(data: Omit<OfflineData, 'id' | 'timestamp'>): Promise<string> {
    await this.ensureInitialized();
    
    const fullData: OfflineData = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const request = store.add(fullData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(fullData.id);
    });
  }

  async getOfflineData(): Promise<OfflineData[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removeOfflineData(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // ===== AUTO-SAVE =====

  async addAutoSaveData(data: Omit<AutoSaveData, 'id' | 'timestamp'>): Promise<string> {
    await this.ensureInitialized();
    
    const fullData: AutoSaveData = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['autoSave'], 'readwrite');
      const store = transaction.objectStore('autoSave');
      
      const request = store.add(fullData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(fullData.id);
    });
  }

  async getAutoSaveData(): Promise<AutoSaveData[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['autoSave'], 'readonly');
      const store = transaction.objectStore('autoSave');
      
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removeAutoSaveData(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['autoSave'], 'readwrite');
      const store = transaction.objectStore('autoSave');
      
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // ===== LOG DE SINCRONIZAÇÃO =====

  async addSyncLog(entry: Omit<SyncLogEntry, 'id' | 'timestamp'>): Promise<void> {
    await this.ensureInitialized();
    
    const fullEntry: SyncLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncLog'], 'readwrite');
      const store = transaction.objectStore('syncLog');
      
      const request = store.add(fullEntry);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSyncLogs(limit: number = 50): Promise<SyncLogEntry[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncLog'], 'readonly');
      const store = transaction.objectStore('syncLog');
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'prev');
      const results: SyncLogEntry[] = [];
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  }

  // ===== UTILITÁRIOS =====

  async getStats(): Promise<{
    operations: number;
    offlineData: number;
    autoSave: number;
    syncLog: number;
  }> {
    await this.ensureInitialized();

    const stores = ['operations', 'offlineData', 'autoSave', 'syncLog'];
    const stats: any = {};

    for (const storeName of stores) {
      stats[storeName] = await new Promise<number>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        
        const request = store.count();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }

    return stats;
  }

  async clearAll(): Promise<void> {
    await this.ensureInitialized();

    const stores = ['operations', 'offlineData', 'autoSave', 'syncLog'];

    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }

    console.log('[OfflineDB] Todos os dados foram limpos');
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('[OfflineDB] Conexão fechada');
    }
  }
}

// Instância singleton
export const offlineDB = new OfflineDBManager();

// Tipos exportados
export type { 
  OfflineOperation, 
  OfflineData, 
  AutoSaveData, 
  SyncLogEntry 
};
