/**
 * Sistema Singleton para Service Worker
 * Evita múltiplos registros simultâneos e conflitos
 */

export interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export interface CacheStats {
  [cacheName: string]: number;
}

class ServiceWorkerSingleton {
  private static instance: ServiceWorkerSingleton;
  private registration: ServiceWorkerRegistration | null = null;
  private isRegistering = false;
  private registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;
  private config: ServiceWorkerConfig = {};
  private listeners: Set<(data: any) => void> = new Set();
  private debounceTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    // Singleton - construtor privado
  }

  /**
   * Obter instância singleton
   */
  public static getInstance(): ServiceWorkerSingleton {
    if (!ServiceWorkerSingleton.instance) {
      ServiceWorkerSingleton.instance = new ServiceWorkerSingleton();
    }
    return ServiceWorkerSingleton.instance;
  }

  /**
   * Verificar se Service Workers são suportados
   */
  public isSupported(): boolean {
    return 'serviceWorker' in navigator && 'caches' in window;
  }

  /**
   * Verificar se já existe um registro ativo
   */
  public async isAlreadyRegistered(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    } catch (error) {
      console.warn('[SW Singleton] Erro ao verificar registros existentes:', error);
      return false;
    }
  }

  /**
   * Registrar Service Worker com debounce
   */
  public async register(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> {
    // Debounce para evitar chamadas simultâneas
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    return new Promise((resolve) => {
      this.debounceTimeout = setTimeout(async () => {
        const result = await this._doRegister(config);
        resolve(result);
      }, 100); // 100ms de debounce
    });
  }

  /**
   * Método interno para registro
   */
  private async _doRegister(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> {
    this.config = { ...this.config, ...config };

    if (!this.isSupported()) {
      console.warn('[SW Singleton] Service Worker não é suportado neste navegador');
      return null;
    }

    // Se já está registrando, retornar a promise existente
    if (this.isRegistering && this.registrationPromise) {
      console.log('[SW Singleton] Registro já em andamento, reutilizando promise');
      return this.registrationPromise;
    }

    // Se já está registrado, retornar o registro existente
    if (this.registration) {
      console.log('[SW Singleton] Service Worker já registrado');
      return this.registration;
    }

    // Verificar se já existe um registro no navegador
    const alreadyRegistered = await this.isAlreadyRegistered();
    if (alreadyRegistered) {
      try {
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          console.log('[SW Singleton] Usando registro existente do navegador');
          this.registration = existingRegistration;
          this.setupEventListeners(existingRegistration);
          this.notifyListeners();
          return existingRegistration;
        }
      } catch (error) {
        console.warn('[SW Singleton] Erro ao obter registro existente:', error);
      }
    }

    // Iniciar novo registro
    this.isRegistering = true;
    this.registrationPromise = this._performRegistration();

    try {
      const result = await this.registrationPromise;
      return result;
    } finally {
      this.isRegistering = false;
      this.registrationPromise = null;
    }
  }

  /**
   * Executar o registro do Service Worker
   */
  private async _performRegistration(): Promise<ServiceWorkerRegistration | null> {
    try {
      console.log('[SW Singleton] Iniciando registro do Service Worker');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.registration = registration;
      this.setupEventListeners(registration);
      
      console.log('[SW Singleton] Service Worker registrado com sucesso:', registration.scope);
      
      if (this.config.onSuccess) {
        this.config.onSuccess(registration);
      }

      this.notifyListeners();
      return registration;

    } catch (error) {
      console.error('[SW Singleton] Erro ao registrar Service Worker:', error);
      
      if (this.config.onError) {
        this.config.onError(error as Error);
      }
      
      return null;
    }
  }

  /**
   * Configurar event listeners
   */
  private setupEventListeners(registration: ServiceWorkerRegistration): void {
    registration.addEventListener('updatefound', () => {
      console.log('[SW Singleton] Atualização encontrada');
      
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW Singleton] Nova versão disponível');
            
            if (this.config.onUpdate) {
              this.config.onUpdate(registration);
            }
            
            this.notifyListeners();
          }
        });
      }
    });
  }

  /**
   * Adicionar listener para mudanças
   */
  public addListener(callback: (data: any) => void): () => void {
    this.listeners.add(callback);
    
    // Retornar função de cleanup
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notificar todos os listeners
   */
  private notifyListeners(): void {
    const data = {
      isRegistered: !!this.registration,
      isSupported: this.isSupported(),
      registration: this.registration
    };

    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[SW Singleton] Erro ao notificar listener:', error);
      }
    });
  }

  /**
   * Desregistrar Service Worker
   */
  public async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('[SW Singleton] Service Worker desregistrado');
      this.registration = null;
      this.notifyListeners();
      return result;
    } catch (error) {
      console.error('[SW Singleton] Erro ao desregistrar Service Worker:', error);
      return false;
    }
  }

  /**
   * Forçar atualização
   */
  public async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker não está registrado');
    }

    try {
      await this.registration.update();
      console.log('[SW Singleton] Atualização forçada');
    } catch (error) {
      console.error('[SW Singleton] Erro ao forçar atualização:', error);
      throw error;
    }
  }

  /**
   * Limpar cache
   */
  public async clearCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[SW Singleton] Cache limpo');
    } catch (error) {
      console.error('[SW Singleton] Erro ao limpar cache:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas do cache
   */
  public async getCacheStats(): Promise<CacheStats> {
    try {
      const cacheNames = await caches.keys();
      const stats: CacheStats = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = keys.length;
      }

      return stats;
    } catch (error) {
      console.error('[SW Singleton] Erro ao obter estatísticas do cache:', error);
      return {};
    }
  }

  /**
   * Obter informações do Service Worker
   */
  public getInfo(): {
    isSupported: boolean;
    isRegistered: boolean;
    isActive: boolean;
    state?: string;
  } {
    const isSupported = this.isSupported();
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

  /**
   * Verificar se está online
   */
  public isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Escutar mudanças de conectividade
   */
  public onConnectivityChange(callback: (isOnline: boolean) => void): () => void {
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
}

// Exportar instância singleton
export const serviceWorkerSingleton = ServiceWorkerSingleton.getInstance();
export default serviceWorkerSingleton;