import { useCallback } from 'react';
import { useBackgroundSync } from './useBackgroundSync';

/**
 * Wrapper para hooks existentes que adiciona funcionalidade de Background Sync
 * Permite que operações sejam executadas offline e sincronizadas automaticamente
 */
export const useWithBackgroundSync = () => {
  const backgroundSync = useBackgroundSync({
    autoSync: true,
    syncInterval: 30000, // 30 segundos
    maxRetries: 3,
    enabled: true
  });

  // Wrapper para operações de criação
  const createWithSync = useCallback(async <T>(
    tableName: string,
    data: T,
    onlineAction: () => Promise<T & { id: string }>
  ): Promise<T & { id: string; _offline?: boolean; _pendingSync?: boolean }> => {
    try {
      // Tentar executar online primeiro
      if (backgroundSync.isOnline) {
        return await onlineAction();
      } else {
        // Se offline, adicionar à fila de sincronização
        const operationId = await backgroundSync.addOfflineOperation(
          'CREATE',
          tableName,
          data
        );
        
        console.log('[OfflineSync] Operação CREATE adicionada à fila:', tableName, operationId);
        
        // Retornar resultado local temporário
        return {
          id: operationId,
          ...data,
          _offline: true,
          _pendingSync: true
        };
      }
    } catch (error) {
      // Se falhar online, tentar offline
      if (backgroundSync.isOnline) {
        const operationId = await backgroundSync.addOfflineOperation(
          'CREATE',
          tableName,
          data
        );
        
        console.log('[OfflineSync] Operação CREATE falhou online, adicionada à fila:', tableName);
        
        return {
          id: operationId,
          ...data,
          _offline: true,
          _pendingSync: true
        };
      }
      throw error;
    }
  }, [backgroundSync]);

  // Wrapper para operações de atualização
  const updateWithSync = useCallback(async <T>(
    tableName: string,
    id: string,
    data: T,
    onlineAction: () => Promise<T & { id: string }>
  ): Promise<T & { id: string; _offline?: boolean; _pendingSync?: boolean }> => {
    try {
      // Tentar executar online primeiro
      if (backgroundSync.isOnline) {
        return await onlineAction();
      } else {
        // Se offline, adicionar à fila de sincronização
        const operationId = await backgroundSync.addOfflineOperation(
          'UPDATE',
          tableName,
          { id, ...data }
        );
        
        console.log('[OfflineSync] Operação UPDATE adicionada à fila:', tableName, id);
        
        // Retornar resultado local temporário
        return {
          id,
          ...data,
          _offline: true,
          _pendingSync: true
        };
      }
    } catch (error) {
      // Se falhar online, tentar offline
      if (backgroundSync.isOnline) {
        const operationId = await backgroundSync.addOfflineOperation(
          'UPDATE',
          tableName,
          { id, ...data }
        );
        
        console.log('[OfflineSync] Operação UPDATE falhou online, adicionada à fila:', tableName);
        
        return {
          id,
          ...data,
          _offline: true,
          _pendingSync: true
        };
      }
      throw error;
    }
  }, [backgroundSync]);

  // Wrapper para operações de exclusão
  const deleteWithSync = useCallback(async (
    tableName: string,
    id: string,
    onlineAction: () => Promise<{ id: string }>
  ): Promise<{ id: string; _offline?: boolean; _pendingSync?: boolean; _deleted?: boolean }> => {
    try {
      // Tentar executar online primeiro
      if (backgroundSync.isOnline) {
        return await onlineAction();
      } else {
        // Se offline, adicionar à fila de sincronização
        const operationId = await backgroundSync.addOfflineOperation(
          'DELETE',
          tableName,
          { id }
        );
        
        console.log('[OfflineSync] Operação DELETE adicionada à fila:', tableName, id);
        
        // Retornar confirmação local
        return {
          id,
          _offline: true,
          _pendingSync: true,
          _deleted: true
        };
      }
    } catch (error) {
      // Se falhar online, tentar offline
      if (backgroundSync.isOnline) {
        const operationId = await backgroundSync.addOfflineOperation(
          'DELETE',
          tableName,
          { id }
        );
        
        console.log('[OfflineSync] Operação DELETE falhou online, adicionada à fila:', tableName);
        
        return {
          id,
          _offline: true,
          _pendingSync: true,
          _deleted: true
        };
      }
      throw error;
    }
  }, [backgroundSync]);

  // Wrapper genérico para qualquer operação
  const executeWithSync = useCallback(async <T>(
    operationName: string,
    onlineAction: () => Promise<T>,
    fallbackData?: T
  ): Promise<T> => {
    try {
      if (backgroundSync.isOnline) {
        return await onlineAction();
      } else {
        console.log('[OfflineSync] Operação executada offline:', operationName);
        
        // Retornar dados de fallback se disponíveis
        if (fallbackData !== undefined) {
          return {
            ...fallbackData,
            _offline: true
          } as T;
        }
        
        throw new Error(`Operação ${operationName} não disponível offline`);
      }
    } catch (error) {
      console.error('[OfflineSync] Erro na operação:', operationName, error);
      
      // Retornar dados de fallback em caso de erro, se disponíveis
      if (fallbackData !== undefined) {
        return {
          ...fallbackData,
          _offline: true,
          _error: true
        } as T;
      }
      
      throw error;
    }
  }, [backgroundSync.isOnline]);

  return {
    // Estado do Background Sync
    ...backgroundSync,
    
    // Wrappers para operações
    createWithSync,
    updateWithSync,
    deleteWithSync,
    executeWithSync
  };
};
