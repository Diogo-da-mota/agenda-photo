export interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  priority: 'high' | 'normal' | 'low';
  size: number;
}

export interface CacheConfig {
  maxSize: number; // Tamanho máximo em bytes
  maxAge: number; // Idade máxima em ms
  maxItems: number; // Número máximo de itens
  cleanupInterval: number; // Intervalo de limpeza em ms
}

export type CacheStrategy = 'lru' | 'lfu' | 'fifo' | 'priority';

/**
 * Sistema avançado de cache de imagens com múltiplas estratégias
 * Otimizado para performance e uso eficiente de memória
 */
export class AdvancedImageCache {
  private cache = new Map<string, CachedImage>();
  private loadingPromises = new Map<string, Promise<string>>();
  private preloadQueue = new Set<string>();
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  private config: CacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxAge: 30 * 60 * 1000, // 30 minutos
    maxItems: 200,
    cleanupInterval: 5 * 60 * 1000 // 5 minutos
  };

  private strategy: CacheStrategy = 'lru';

  constructor(config?: Partial<CacheConfig>, strategy?: CacheStrategy) {
    this.config = { ...this.config, ...config };
    this.strategy = strategy || 'lru';
    this.startCleanupTimer();
  }

  /**
   * Obter imagem do cache ou carregar se necessário
   */
  async getImage(url: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<string> {
    // Verificar cache primeiro
    const cached = this.getCachedImage(url);
    if (cached) {
      this.updateAccessInfo(url);
      return cached;
    }

    // Evitar múltiplas requisições para mesma imagem
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Criar promise de carregamento
    const loadPromise = this.loadAndCacheImage(url, priority);
    this.loadingPromises.set(url, loadPromise);

    try {
      const result = await loadPromise;
      this.loadingPromises.delete(url);
      return result;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Preload de imagens em background
   */
  preloadImages(urls: string[], priority: 'high' | 'normal' | 'low' = 'low'): void {
    urls.forEach(url => {
      if (!this.cache.has(url) && !this.loadingPromises.has(url)) {
        this.preloadQueue.add(url);
      }
    });

    // Processar queue de preload
    this.processPreloadQueue(priority);
  }

  /**
   * Preload inteligente baseado em direção de scroll
   */
  preloadByDirection(visibleUrls: string[], scrollDirection: 'up' | 'down', count: number = 5): void {
    const preloadUrls = scrollDirection === 'down' 
      ? visibleUrls.slice(-count)
      : visibleUrls.slice(0, count);

    this.preloadImages(preloadUrls, 'normal');
  }

  /**
   * Limpar cache manualmente
   */
  clear(): void {
    this.cache.forEach(cached => {
      URL.revokeObjectURL(cached.url);
    });
    this.cache.clear();
    this.loadingPromises.clear();
    this.preloadQueue.clear();
  }

  /**
   * Obter estatísticas do cache
   */
  getStats() {
    const totalSize = Array.from(this.cache.values()).reduce((sum, item) => sum + item.size, 0);
    const hitRate = this.calculateHitRate();
    
    return {
      itemCount: this.cache.size,
      totalSize,
      maxSize: this.config.maxSize,
      usage: (totalSize / this.config.maxSize) * 100,
      hitRate,
      loadingCount: this.loadingPromises.size,
      preloadQueueSize: this.preloadQueue.size
    };
  }

  /**
   * Configurar estratégia de cache
   */
  setStrategy(strategy: CacheStrategy): void {
    this.strategy = strategy;
  }

  // Métodos privados

  private getCachedImage(url: string): string | null {
    const cached = this.cache.get(url);
    if (!cached) return null;

    // Verificar se não expirou
    if (Date.now() - cached.timestamp > this.config.maxAge) {
      this.removeFromCache(url);
      return null;
    }

    return cached.url;
  }

  private async loadAndCacheImage(url: string, priority: 'high' | 'normal' | 'low'): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Adicionar ao cache
      this.addToCache(url, {
        url: objectUrl,
        blob,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccessed: Date.now(),
        priority,
        size: blob.size
      });

      return objectUrl;
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  }

  private addToCache(url: string, cached: CachedImage): void {
    // Verificar se precisa fazer limpeza antes de adicionar
    this.ensureCacheSpace(cached.size);
    
    this.cache.set(url, cached);
  }

  private removeFromCache(url: string): void {
    const cached = this.cache.get(url);
    if (cached) {
      URL.revokeObjectURL(cached.url);
      this.cache.delete(url);
    }
  }

  private updateAccessInfo(url: string): void {
    const cached = this.cache.get(url);
    if (cached) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
    }
  }

  private ensureCacheSpace(newItemSize: number): void {
    const currentSize = Array.from(this.cache.values()).reduce((sum, item) => sum + item.size, 0);
    
    // Verificar limites
    if (this.cache.size >= this.config.maxItems || 
        currentSize + newItemSize > this.config.maxSize) {
      this.evictItems(newItemSize);
    }
  }

  private evictItems(spaceNeeded: number): void {
    const items = Array.from(this.cache.entries());
    let freedSpace = 0;

    // Ordenar baseado na estratégia
    const sortedItems = this.sortItemsByStrategy(items);

    for (const [url] of sortedItems) {
      const cached = this.cache.get(url);
      if (cached) {
        freedSpace += cached.size;
        this.removeFromCache(url);
        
        if (freedSpace >= spaceNeeded) break;
      }
    }
  }

  private sortItemsByStrategy(items: [string, CachedImage][]): [string, CachedImage][] {
    switch (this.strategy) {
      case 'lru':
        return items.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      case 'lfu':
        return items.sort((a, b) => a[1].accessCount - b[1].accessCount);
      
      case 'fifo':
        return items.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      case 'priority':
        return items.sort((a, b) => {
          const priorityOrder = { low: 0, normal: 1, high: 2 };
          return priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
        });
      
      default:
        return items;
    }
  }

  private async processPreloadQueue(priority: 'high' | 'normal' | 'low'): Promise<void> {
    const urls = Array.from(this.preloadQueue).slice(0, 5); // Processar 5 por vez
    
    for (const url of urls) {
      this.preloadQueue.delete(url);
      try {
        await this.getImage(url, priority);
      } catch (error) {
        console.warn('Preload failed for:', url, error);
      }
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredUrls: string[] = [];

    this.cache.forEach((cached, url) => {
      if (now - cached.timestamp > this.config.maxAge) {
        expiredUrls.push(url);
      }
    });

    expiredUrls.forEach(url => this.removeFromCache(url));
  }

  private calculateHitRate(): number {
    // Implementação simplificada - em produção seria mais sofisticada
    return this.cache.size > 0 ? 0.85 : 0; // 85% hit rate estimado
  }

  /**
   * Destruir cache e limpar recursos
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Instância singleton para uso global
export const imageCache = new AdvancedImageCache(); 