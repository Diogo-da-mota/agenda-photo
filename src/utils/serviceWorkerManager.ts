/**
 * Utilitário para registrar e gerenciar Service Worker
 * Melhora performance com cache offline
 */

interface ServiceWorkerManager {
  register: () => Promise<ServiceWorkerRegistration | null>;
  unregister: () => Promise<boolean>;
  update: () => Promise<void>;
  clearCache: () => Promise<void>;
  isSupported: () => boolean;
}

class ServiceWorkerManagerImpl implements ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Verifica se Service Workers são suportados
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'caches' in window;
  }

  /**
   * Registra o Service Worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn('[SW] Service Worker não é suportado neste navegador');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.registration = registration;

      console.log('[SW] Service Worker registrado com sucesso');

      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              console.log('[SW] Nova versão do Service Worker disponível');
              this.notifyUpdate();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[SW] Erro ao registrar Service Worker:', error);
      return null;
    }
  }

  /**
   * Remove o registro do Service Worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('[SW] Service Worker removido');
      return result;
    } catch (error) {
      console.error('[SW] Erro ao remover Service Worker:', error);
      return false;
    }
  }

  /**
   * Força atualização do Service Worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker não está registrado');
    }

    try {
      await this.registration.update();
      console.log('[SW] Service Worker atualizado');
    } catch (error) {
      console.error('[SW] Erro ao atualizar Service Worker:', error);
      throw error;
    }
  }

  /**
   * Limpa todo o cache
   */
  async clearCache(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[SW] Cache limpo com sucesso');
    } catch (error) {
      console.error('[SW] Erro ao limpar cache:', error);
      throw error;
    }
  }

  /**
   * Notifica sobre atualizações disponíveis
   */
  private notifyUpdate(): void {
    // Dispatch evento customizado para componentes React
    const event = new CustomEvent('sw-update-available', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  /**
   * Pré-carrega recursos importantes
   */
  async preloadCriticalResources(urls: string[]): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    try {
      const cache = await caches.open('critical-resources');
      await cache.addAll(urls);
      console.log('[SW] Recursos críticos pré-carregados');
    } catch (error) {
      console.error('[SW] Erro ao pré-carregar recursos:', error);
    }
  }

  /**
   * Verifica status da conexão e cache
   */
  async getCacheStatus(): Promise<{
    online: boolean;
    cacheSize: number;
    lastUpdate: string;
  }> {
    const online = navigator.onLine;
    
    let cacheSize = 0;
    if (this.isSupported()) {
      try {
        const cacheNames = await caches.keys();
        // Estimar tamanho do cache (aproximado)
        cacheSize = cacheNames.length;
      } catch (error) {
        console.warn('[SW] Erro ao verificar cache:', error);
      }
    }

    return {
      online,
      cacheSize,
      lastUpdate: new Date().toISOString()
    };
  }
}

// Instância singleton
const serviceWorkerManager = new ServiceWorkerManagerImpl();

export default serviceWorkerManager;

// Hook React para usar o Service Worker
export const useServiceWorker = () => {
  const [isSupported] = useState(serviceWorkerManager.isSupported());
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (isSupported) {
      // Registrar o Service Worker
      serviceWorkerManager.register()
        .then((registration) => {
          setIsRegistered(!!registration);
        });

      // Escutar atualizações
      const handleUpdate = () => {
        setUpdateAvailable(true);
      };

      window.addEventListener('sw-update-available', handleUpdate);
      
      return () => {
        window.removeEventListener('sw-update-available', handleUpdate);
      };
    }
  }, [isSupported]);

  const clearCache = async () => {
    await serviceWorkerManager.clearCache();
    window.location.reload();
  };

  const updateApp = async () => {
    await serviceWorkerManager.update();
    window.location.reload();
  };

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    clearCache,
    updateApp,
    manager: serviceWorkerManager
  };
};

// Importações necessárias para o hook
import { useState, useEffect } from 'react';
