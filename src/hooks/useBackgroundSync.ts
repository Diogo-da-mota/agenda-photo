import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface OfflineOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  headers: Record<string, string>;
  timestamp: number;
  retryCount: number;
  tableName?: string;
}

interface BackgroundSyncState {
  isOnline: boolean;
  pendingOperations: number;
  lastSyncTime: Date | null;
  syncInProgress: boolean;
  errors: string[];
}

interface UseBackgroundSyncOptions {
  autoSync?: boolean;
  syncInterval?: number; // em milissegundos
  maxRetries?: number;
  enabled?: boolean;
}

/**
 * Hook para gerenciar sincronização em background
 * Permite que operações sejam executadas offline e sincronizadas quando a conexão retornar
 */
export const useBackgroundSync = (options: UseBackgroundSyncOptions = {}) => {
  const {
    autoSync = true,
    syncInterval = 30000, // 30 segundos
    maxRetries = 3,
    enabled = true
  } = options;

  const { toast } = useToast();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dbRef = useRef<IDBDatabase | null>(null);

  const [state, setState] = useState<BackgroundSyncState>({
    isOnline: navigator.onLine,
    pendingOperations: 0,
    lastSyncTime: null,
    syncInProgress: false,
    errors: []
  });

  // Abrir conexão com IndexedDB
  const openDB = useCallback(async (): Promise<IDBDatabase> => {
    if (dbRef.current) return dbRef.current;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BrightSparkOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        dbRef.current = request.result;
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('operations')) {
          const operationsStore = db.createObjectStore('operations', { keyPath: 'id' });
          operationsStore.createIndex('type', 'type');
          operationsStore.createIndex('timestamp', 'timestamp');
          operationsStore.createIndex('tableName', 'tableName');
        }
        
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          offlineStore.createIndex('type', 'type');
          offlineStore.createIndex('timestamp', 'timestamp');
        }
        
        if (!db.objectStoreNames.contains('autoSave')) {
          const autoSaveStore = db.createObjectStore('autoSave', { keyPath: 'id' });
          autoSaveStore.createIndex('type', 'type');
          autoSaveStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }, []);

  // Adicionar operação à fila offline
  const addOfflineOperation = useCallback(async (
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    tableName: string,
    data: any,
    endpoint?: string
  ): Promise<string> => {
    if (!enabled) return '';

    try {
      const db = await openDB();
      const transaction = db.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      
      const operation: OfflineOperation = {
        id: crypto.randomUUID(),
        type,
        endpoint: endpoint || `/api/${tableName}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
        },
        timestamp: Date.now(),
        retryCount: 0,
        tableName
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.add(operation);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      setState(prev => ({
        ...prev,
        pendingOperations: prev.pendingOperations + 1
      }));

      // Tentar sincronizar imediatamente se online
      if (state.isOnline && autoSync) {
        setTimeout(() => syncOperations(), 100);
      }

      console.log('[BackgroundSync] Operação adicionada à fila:', operation.type, tableName);
      return operation.id;
    } catch (error) {
      console.error('[BackgroundSync] Erro ao adicionar operação:', error);
      throw error;
    }
  }, [enabled, state.isOnline, autoSync, openDB]);

  // Sincronizar operações pendentes
  const syncOperations = useCallback(async (): Promise<boolean> => {
    if (!enabled || state.syncInProgress || !state.isOnline) return false;

    setState(prev => ({ ...prev, syncInProgress: true, errors: [] }));

    try {
      const db = await openDB();
      const transaction = db.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      
      const operations = await new Promise<OfflineOperation[]>((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      let syncedCount = 0;
      const errors: string[] = [];

      for (const operation of operations) {
        try {
          await executeOperation(operation);
          
          // Remover operação sincronizada
          await new Promise<void>((resolve, reject) => {
            const deleteRequest = store.delete(operation.id);
            deleteRequest.onerror = () => reject(deleteRequest.error);
            deleteRequest.onsuccess = () => resolve();
          });

          syncedCount++;
          console.log('[BackgroundSync] Operação sincronizada:', operation.type, operation.tableName);
        } catch (error) {
          console.error('[BackgroundSync] Erro ao sincronizar operação:', error);
          
          // Incrementar contador de tentativas
          operation.retryCount++;
          
          if (operation.retryCount >= maxRetries) {
            // Remover após máximo de tentativas
            await new Promise<void>((resolve, reject) => {
              const deleteRequest = store.delete(operation.id);
              deleteRequest.onerror = () => reject(deleteRequest.error);
              deleteRequest.onsuccess = () => resolve();
            });
            
            errors.push(`Falha ao sincronizar ${operation.type} em ${operation.tableName} após ${maxRetries} tentativas`);
          } else {
            // Salvar com contador incrementado
            await new Promise<void>((resolve, reject) => {
              const putRequest = store.put(operation);
              putRequest.onerror = () => reject(putRequest.error);
              putRequest.onsuccess = () => resolve();
            });
          }
        }
      }

      setState(prev => ({
        ...prev,
        pendingOperations: Math.max(0, prev.pendingOperations - syncedCount),
        lastSyncTime: new Date(),
        syncInProgress: false,
        errors
      }));

      if (syncedCount > 0) {
        toast({
          title: "Sincronização concluída",
          description: `${syncedCount} operação(ões) sincronizada(s) com sucesso.`,
        });
      }

      if (errors.length > 0) {
        toast({
          title: "Erros na sincronização",
          description: `${errors.length} operação(ões) falharam após múltiplas tentativas.`,
          variant: "destructive"
        });
      }

      return syncedCount > 0;
    } catch (error) {
      console.error('[BackgroundSync] Erro na sincronização:', error);
      setState(prev => ({
        ...prev,
        syncInProgress: false,
        errors: [...prev.errors, 'Erro geral na sincronização']
      }));
      return false;
    }
  }, [enabled, state.syncInProgress, state.isOnline, maxRetries, openDB, toast]);

  // Executar operação individual
  const executeOperation = useCallback(async (operation: OfflineOperation): Promise<void> => {
    const { type, tableName, data } = operation;

    // Type assertion para contornar a verificação de tipos do Supabase
    const table = tableName as any;

    switch (type) {
      case 'CREATE':
        const { error: insertError } = await supabase.from(table).insert(data);
        if (insertError) throw insertError;
        break;
      case 'UPDATE':
        const { error: updateError } = await supabase.from(table).update(data).eq('id', data.id);
        if (updateError) throw updateError;
        break;
      case 'DELETE':
        const { error: deleteError } = await supabase.from(table).delete().eq('id', data.id);
        if (deleteError) throw deleteError;
        break;
      default:
        throw new Error(`Tipo de operação desconhecido: ${type}`);
    }
  }, []);

  // Contar operações pendentes
  const updatePendingCount = useCallback(async () => {
    if (!enabled) return;

    try {
      const db = await openDB();
      const transaction = db.transaction(['operations'], 'readonly');
      const store = transaction.objectStore('operations');
      
      const count = await new Promise<number>((resolve, reject) => {
        const request = store.count();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      setState(prev => ({ ...prev, pendingOperations: count }));
    } catch (error) {
      console.error('[BackgroundSync] Erro ao contar operações pendentes:', error);
    }
  }, [enabled, openDB]);

  // Limpar todas as operações pendentes
  const clearPendingOperations = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    try {
      const db = await openDB();
      const transaction = db.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      setState(prev => ({ ...prev, pendingOperations: 0 }));
      
      toast({
        title: "Operações limpas",
        description: "Todas as operações pendentes foram removidas.",
      });
    } catch (error) {
      console.error('[BackgroundSync] Erro ao limpar operações:', error);
      throw error;
    }
  }, [enabled, openDB, toast]);

  // Registrar Service Worker para Background Sync
  const registerBackgroundSync = useCallback(async (tag: string = 'background-sync-operations') => {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('[BackgroundSync] Background Sync não suportado neste navegador');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      // Type assertion para acessar a propriedade sync
      const syncRegistration = registration as any;
      await syncRegistration.sync.register(tag);
      console.log('[BackgroundSync] Background Sync registrado:', tag);
      return true;
    } catch (error) {
      console.error('[BackgroundSync] Erro ao registrar Background Sync:', error);
      return false;
    }
  }, []);

  // Efeitos
  useEffect(() => {
    if (!enabled) return;

    // Detectar mudanças na conectividade
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (autoSync) {
        setTimeout(() => syncOperations(), 1000);
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Contagem inicial de operações pendentes
    updatePendingCount();

    // Intervalo de sincronização automática
    if (autoSync && syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        if (state.isOnline) {
          syncOperations();
        }
      }, syncInterval);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [enabled, autoSync, syncInterval, state.isOnline, syncOperations, updatePendingCount]);

  return {
    // Estado
    ...state,
    
    // Ações
    addOfflineOperation,
    syncOperations,
    clearPendingOperations,
    registerBackgroundSync,
    updatePendingCount
  };
};
