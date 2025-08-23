import { useState, useEffect, useCallback } from 'react';
import serviceWorkerSingleton from '@/utils/serviceWorkerSingleton';

export interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  isUpdating: boolean;
  cacheStats: {
    totalSize: number;
    itemCount: number;
  };
  registration: ServiceWorkerRegistration | null;
}

export interface ServiceWorkerActions {
  register: () => Promise<boolean>;
  unregister: () => Promise<boolean>;
  update: () => Promise<boolean>;
  clearCache: () => Promise<boolean>;
  skipWaiting: () => Promise<void>;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: serviceWorkerSingleton.isSupported(),
    isRegistered: false,
    isOnline: navigator.onLine,
    updateAvailable: false,
    isUpdating: false,
    cacheStats: {
      totalSize: 0,
      itemCount: 0,
    },
    registration: null,
  });

  // Atualizar estado baseado no singleton
  const updateState = useCallback(async () => {
    const isRegistered = await serviceWorkerSingleton.isRegistered();
    const cacheStats = await serviceWorkerSingleton.getCacheStats();
    const swInfo = await serviceWorkerSingleton.getServiceWorkerInfo();
    
    setState(prev => ({
      ...prev,
      isRegistered,
      cacheStats,
      registration: swInfo.registration,
    }));
  }, []);

  // Registrar Service Worker
  const register = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await serviceWorkerSingleton.register({
        onSuccess: (reg) => {
          console.log('[useServiceWorker] Registration successful:', reg.scope);
          updateState();
        },
        onError: (error) => {
          console.error('[useServiceWorker] Registration failed:', error);
        },
        onUpdate: (reg) => {
          console.log('[useServiceWorker] Update available');
          setState(prev => ({ ...prev, updateAvailable: true, registration: reg }));
        }
      });
      
      return !!registration;
    } catch (error) {
      console.error('[useServiceWorker] Register error:', error);
      return false;
    }
  }, [updateState]);

  // Desregistrar Service Worker
  const unregister = useCallback(async (): Promise<boolean> => {
    try {
      const result = await serviceWorkerSingleton.unregister();
      if (result) {
        await updateState();
      }
      return result;
    } catch (error) {
      console.error('[useServiceWorker] Unregister error:', error);
      return false;
    }
  }, [updateState]);

  // Atualizar Service Worker
  const update = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isUpdating: true }));
      const result = await serviceWorkerSingleton.update();
      setState(prev => ({ ...prev, isUpdating: false, updateAvailable: false }));
      await updateState();
      return result;
    } catch (error) {
      console.error('[useServiceWorker] Update error:', error);
      setState(prev => ({ ...prev, isUpdating: false }));
      return false;
    }
  }, [updateState]);

  // Limpar cache
  const clearCache = useCallback(async (): Promise<boolean> => {
    try {
      const result = await serviceWorkerSingleton.clearCache();
      if (result) {
        await updateState();
      }
      return result;
    } catch (error) {
      console.error('[useServiceWorker] Clear cache error:', error);
      return false;
    }
  }, [updateState]);

  // Skip waiting
  const skipWaiting = useCallback(async (): Promise<void> => {
    try {
      if (state.registration?.waiting) {
        state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setState(prev => ({ ...prev, updateAvailable: false }));
      }
    } catch (error) {
      console.error('[useServiceWorker] Skip waiting error:', error);
    }
  }, [state.registration]);

  // Escutar mudanças de conectividade
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Escutar eventos do singleton
  useEffect(() => {
    const unsubscribe = serviceWorkerSingleton.addListener((event) => {
      switch (event.type) {
        case 'registered':
          setState(prev => ({ ...prev, isRegistered: true, registration: event.registration }));
          break;
        case 'unregistered':
          setState(prev => ({ ...prev, isRegistered: false, registration: null }));
          break;
        case 'updateAvailable':
          setState(prev => ({ ...prev, updateAvailable: true, registration: event.registration }));
          break;
        case 'updated':
          setState(prev => ({ ...prev, updateAvailable: false }));
          updateState();
          break;
        case 'cacheUpdated':
          updateState();
          break;
      }
    });

    // Atualizar estado inicial
    updateState();

    return unsubscribe;
  }, [updateState]);

  const actions: ServiceWorkerActions = {
    register,
    unregister,
    update,
    clearCache,
    skipWaiting,
  };

  return { ...state, ...actions };
}

export default useServiceWorker;