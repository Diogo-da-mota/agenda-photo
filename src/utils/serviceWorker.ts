/**
 * Utilitário para gerenciar Service Worker
 * Registra, atualiza e controla cache offline
 */

import React from 'react';

export interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export interface CacheStats {
  [cacheName: string]: number;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig = {};

  /**
   * Registrar Service Worker
   */
  async register(config: ServiceWorkerConfig = {}): Promise<void> {
    this.config = config;

    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker não é suportado neste navegador');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.registration = registration;

      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        this.handleUpdate(registration);
      });

      // Verificar se já há um SW ativo
      if (registration.active) {
        console.log('Service Worker ativo:', registration.active.state);
        this.config.onSuccess?.(registration);
      }

      // Escutar mudanças de estado
      if (registration.installing) {
        this.trackInstalling(registration.installing);
      } else if (registration.waiting) {
        this.config.onUpdate?.(registration);
      }

      console.log('Service Worker registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      this.config.onError?.(error as Error);
    }
  }

  /**
   * Desregistrar Service Worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker desregistrado:', result);
      return result;
    } catch (error) {
      console.error('Erro ao desregistrar Service Worker:', error);
      return false;
    }
  }

  /**
   * Forçar atualização do Service Worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker não está registrado');
    }

    try {
      await this.registration.update();
      console.log('Service Worker atualizado');
    } catch (error) {
      console.error('Erro ao atualizar Service Worker:', error);
      throw error;
    }
  }

  /**
   * Pular waiting e ativar novo Service Worker
   */
  skipWaiting(): void {
    if (!this.registration?.waiting) {
      console.warn('Nenhum Service Worker aguardando');
      return;
    }

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Obter estatísticas do cache
   */
  async getCacheStats(): Promise<CacheStats> {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('Nenhum Service Worker ativo'));
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_STATS') {
          resolve(event.data.data);
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_STATS' },
        [messageChannel.port2]
      );

      // Timeout após 5 segundos
      setTimeout(() => {
        reject(new Error('Timeout ao obter estatísticas do cache'));
      }, 5000);
    });
  }

  /**
   * Limpar todo o cache
   */
  async clearCache(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('Nenhum Service Worker ativo'));
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_CLEARED') {
          resolve();
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );

      // Timeout após 10 segundos
      setTimeout(() => {
        reject(new Error('Timeout ao limpar cache'));
      }, 10000);
    });
  }

  /**
   * Preload de rotas importantes
   */
  preloadRoutes(routes: string[]): void {
    if (!navigator.serviceWorker.controller) {
      console.warn('Nenhum Service Worker ativo para preload');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'PRELOAD_ROUTES',
      routes
    });

    console.log('Preload iniciado para rotas:', routes);
  }

  /**
   * Verificar se está online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Escutar mudanças de conectividade
   */
  onConnectivityChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Retornar função de cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Obter informações do Service Worker
   */
  getInfo(): {
    isSupported: boolean;
    isRegistered: boolean;
    isActive: boolean;
    state?: string;
  } {
    const isSupported = 'serviceWorker' in navigator;
    const isRegistered = !!this.registration;
    const isActive = !!this.registration?.active;
    const state = this.registration?.active?.state;

    return {
      isSupported,
      isRegistered,
      isActive,
      state
    };
  }

  // Métodos privados

  private handleUpdate(registration: ServiceWorkerRegistration): void {
    const installingWorker = registration.installing;
    
    if (installingWorker) {
      this.trackInstalling(installingWorker);
    }
  }

  private trackInstalling(worker: ServiceWorker): void {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // Novo conteúdo disponível
          console.log('Nova versão do Service Worker disponível');
          this.config.onUpdate?.(this.registration!);
        } else {
          // Primeira instalação
          console.log('Service Worker instalado pela primeira vez');
          this.config.onSuccess?.(this.registration!);
        }
      }
    });
  }
}

// Instância singleton
export const serviceWorkerManager = new ServiceWorkerManager();

/**
 * Hook para usar Service Worker em componentes React
 */
export function useServiceWorker(config: ServiceWorkerConfig = {}) {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [cacheStats, setCacheStats] = React.useState<CacheStats | null>(null);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);

  React.useEffect(() => {
    const registerSW = async () => {
      await serviceWorkerManager.register({
        ...config,
        onSuccess: (registration) => {
          setIsRegistered(true);
          config.onSuccess?.(registration);
        },
        onUpdate: (registration) => {
          setUpdateAvailable(true);
          config.onUpdate?.(registration);
        },
        onError: config.onError
      });
    };

    // Descomente a linha abaixo para reativar o Service Worker quando necessário
    // registerSW();

    // Escutar mudanças de conectividade
    const cleanup = serviceWorkerManager.onConnectivityChange(setIsOnline);

    return cleanup;
  }, []);

  const updateServiceWorker = React.useCallback(() => {
    serviceWorkerManager.skipWaiting();
    setUpdateAvailable(false);
    window.location.reload();
  }, []);

  const refreshCacheStats = React.useCallback(async () => {
    try {
      const stats = await serviceWorkerManager.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Erro ao obter estatísticas do cache:', error);
    }
  }, []);

  const clearCache = React.useCallback(async () => {
    try {
      await serviceWorkerManager.clearCache();
      setCacheStats(null);
      console.log('Cache limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }, []);

  return {
    isRegistered,
    isOnline,
    updateAvailable,
    cacheStats,
    updateServiceWorker,
    refreshCacheStats,
    clearCache,
    preloadRoutes: serviceWorkerManager.preloadRoutes.bind(serviceWorkerManager),
    getInfo: serviceWorkerManager.getInfo.bind(serviceWorkerManager)
  };
}

// Utilitários de desenvolvimento
export const devUtils = {
  /**
   * Desregistrar todos os Service Workers (apenas desenvolvimento)
   */
  async unregisterAll(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Esta função só deve ser usada em desenvolvimento');
      return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
    }
    
    console.log(`${registrations.length} Service Workers desregistrados`);
  },

  /**
   * Limpar todos os caches (apenas desenvolvimento)
   */
  async clearAllCaches(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Esta função só deve ser usada em desenvolvimento');
      return;
    }

    const cacheNames = await caches.keys();
    
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    console.log(`${cacheNames.length} caches removidos`);
  }
};

// Service Worker está pronto para uso 