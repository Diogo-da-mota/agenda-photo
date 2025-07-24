import { imageCache } from './ImageCache';

export interface PreloadStrategy {
  name: string;
  priority: 'high' | 'normal' | 'low';
  maxConcurrent: number;
  delay: number;
}

export interface ScrollBehavior {
  direction: 'up' | 'down' | 'none';
  speed: number;
  acceleration: number;
  lastPosition: number;
  lastTimestamp: number;
}

export interface ViewportInfo {
  width: number;
  height: number;
  scrollTop: number;
  scrollLeft: number;
}

/**
 * Sistema inteligente de preload de imagens
 * Adapta estratégias baseado no comportamento do usuário
 */
export class ImagePreloader {
  private strategies: Map<string, PreloadStrategy> = new Map();
  private scrollBehavior: ScrollBehavior = {
    direction: 'none',
    speed: 0,
    acceleration: 0,
    lastPosition: 0,
    lastTimestamp: Date.now()
  };
  
  private preloadQueue: Array<{
    url: string;
    priority: 'high' | 'normal' | 'low';
    strategy: string;
  }> = [];
  
  private activePreloads = new Set<string>();
  private maxConcurrentPreloads = 3;
  private isProcessing = false;

  constructor() {
    this.initializeStrategies();
  }

  /**
   * Preload baseado na posição atual e direção de scroll
   */
  preloadByViewport(
    allUrls: string[],
    visibleIndices: number[],
    viewport: ViewportInfo,
    itemHeight: number,
    columnsCount: number
  ): void {
    const strategy = this.selectStrategy();
    
    // Calcular quantos itens preload baseado na velocidade de scroll
    const preloadCount = this.calculatePreloadCount();
    
    // Determinar direção e próximos itens
    const nextIndices = this.getNextIndices(visibleIndices, preloadCount, columnsCount, allUrls.length);
    
    // Adicionar URLs à queue de preload
    nextIndices.forEach(index => {
      if (allUrls[index]) {
        this.addToQueue(allUrls[index], strategy.priority, strategy.name);
      }
    });

    this.processQueue();
  }

  /**
   * Preload inteligente baseado em padrões de navegação
   */
  preloadByPattern(urls: string[], pattern: 'sequential' | 'random' | 'priority'): void {
    const strategy = this.strategies.get(pattern) || this.strategies.get('normal')!;
    
    urls.forEach(url => {
      this.addToQueue(url, strategy.priority, strategy.name);
    });

    this.processQueue();
  }

  /**
   * Preload de imagens críticas (above the fold)
   */
  preloadCritical(urls: string[]): void {
    const strategy = this.strategies.get('critical')!;
    
    urls.forEach(url => {
      this.addToQueue(url, strategy.priority, strategy.name);
    });

    // Processar imediatamente para imagens críticas
    this.processQueue();
  }

  /**
   * Atualizar comportamento de scroll para adaptar estratégias
   */
  updateScrollBehavior(scrollTop: number): void {
    const now = Date.now();
    const timeDelta = now - this.scrollBehavior.lastTimestamp;
    const positionDelta = scrollTop - this.scrollBehavior.lastPosition;
    
    if (timeDelta > 0) {
      const speed = Math.abs(positionDelta) / timeDelta;
      const acceleration = (speed - this.scrollBehavior.speed) / timeDelta;
      
      this.scrollBehavior = {
        direction: positionDelta > 0 ? 'down' : positionDelta < 0 ? 'up' : 'none',
        speed,
        acceleration,
        lastPosition: scrollTop,
        lastTimestamp: now
      };

      // Adaptar estratégias baseado no comportamento
      this.adaptStrategies();
    }
  }

  /**
   * Limpar queue de preload
   */
  clearQueue(): void {
    this.preloadQueue.length = 0;
    this.activePreloads.clear();
  }

  /**
   * Obter estatísticas do preloader
   */
  getStats() {
    return {
      queueSize: this.preloadQueue.length,
      activePreloads: this.activePreloads.size,
      scrollBehavior: this.scrollBehavior,
      strategies: Array.from(this.strategies.entries())
    };
  }

  // Métodos privados

  private initializeStrategies(): void {
    this.strategies.set('critical', {
      name: 'critical',
      priority: 'high',
      maxConcurrent: 5,
      delay: 0
    });

    this.strategies.set('normal', {
      name: 'normal',
      priority: 'normal',
      maxConcurrent: 3,
      delay: 100
    });

    this.strategies.set('background', {
      name: 'background',
      priority: 'low',
      maxConcurrent: 2,
      delay: 500
    });

    this.strategies.set('fast-scroll', {
      name: 'fast-scroll',
      priority: 'high',
      maxConcurrent: 4,
      delay: 50
    });

    this.strategies.set('slow-scroll', {
      name: 'slow-scroll',
      priority: 'normal',
      maxConcurrent: 2,
      delay: 200
    });
  }

  private selectStrategy(): PreloadStrategy {
    const { speed, direction } = this.scrollBehavior;
    
    // Scroll rápido - preload agressivo
    if (speed > 5) {
      return this.strategies.get('fast-scroll')!;
    }
    
    // Scroll lento - preload conservador
    if (speed < 1) {
      return this.strategies.get('slow-scroll')!;
    }
    
    // Scroll normal
    return this.strategies.get('normal')!;
  }

  private calculatePreloadCount(): number {
    const { speed, direction } = this.scrollBehavior;
    
    if (direction === 'none') return 3;
    
    // Mais preload para scroll rápido
    if (speed > 5) return 8;
    if (speed > 2) return 5;
    
    return 3;
  }

  private getNextIndices(
    visibleIndices: number[],
    preloadCount: number,
    columnsCount: number,
    totalItems: number
  ): number[] {
    const { direction } = this.scrollBehavior;
    const indices: number[] = [];
    
    if (direction === 'down') {
      // Preload para baixo
      const lastVisible = Math.max(...visibleIndices);
      for (let i = 1; i <= preloadCount; i++) {
        const nextIndex = lastVisible + i;
        if (nextIndex < totalItems) {
          indices.push(nextIndex);
        }
      }
    } else if (direction === 'up') {
      // Preload para cima
      const firstVisible = Math.min(...visibleIndices);
      for (let i = 1; i <= preloadCount; i++) {
        const nextIndex = firstVisible - i;
        if (nextIndex >= 0) {
          indices.push(nextIndex);
        }
      }
    } else {
      // Sem direção definida - preload ao redor dos visíveis
      const minVisible = Math.min(...visibleIndices);
      const maxVisible = Math.max(...visibleIndices);
      
      // Preload algumas linhas acima e abaixo
      const rowsToPreload = Math.ceil(preloadCount / columnsCount);
      
      for (let row = -rowsToPreload; row <= rowsToPreload; row++) {
        for (let col = 0; col < columnsCount; col++) {
          const baseIndex = minVisible + (row * columnsCount);
          const index = baseIndex + col;
          
          if (index >= 0 && index < totalItems && !visibleIndices.includes(index)) {
            indices.push(index);
          }
        }
      }
    }
    
    return indices;
  }

  private addToQueue(url: string, priority: 'high' | 'normal' | 'low', strategy: string): void {
    // Evitar duplicatas
    if (this.preloadQueue.some(item => item.url === url) || this.activePreloads.has(url)) {
      return;
    }

    this.preloadQueue.push({ url, priority, strategy });
    
    // Ordenar queue por prioridade
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.preloadQueue.length > 0 && this.activePreloads.size < this.maxConcurrentPreloads) {
      const item = this.preloadQueue.shift();
      if (!item) break;
      
      this.activePreloads.add(item.url);
      
      // Processar preload em background
      this.preloadImage(item.url, item.priority, item.strategy)
        .finally(() => {
          this.activePreloads.delete(item.url);
          // Continuar processando queue
          if (this.preloadQueue.length > 0) {
            setTimeout(() => this.processQueue(), 50);
          }
        });
    }
    
    this.isProcessing = false;
  }

  private async preloadImage(url: string, priority: 'high' | 'normal' | 'low', strategy: string): Promise<void> {
    try {
      const strategyConfig = this.strategies.get(strategy);
      
      // Aplicar delay baseado na estratégia
      if (strategyConfig?.delay) {
        await new Promise(resolve => setTimeout(resolve, strategyConfig.delay));
      }
      
      // Usar o cache avançado para preload
      await imageCache.getImage(url, priority);
    } catch (error) {
      console.warn(`Preload failed for ${url}:`, error);
    }
  }

  private adaptStrategies(): void {
    const { speed, acceleration } = this.scrollBehavior;
    
    // Adaptar maxConcurrentPreloads baseado na velocidade
    if (speed > 5) {
      this.maxConcurrentPreloads = 5;
    } else if (speed > 2) {
      this.maxConcurrentPreloads = 3;
    } else {
      this.maxConcurrentPreloads = 2;
    }
    
    // Adaptar estratégias baseado na aceleração
    if (acceleration > 0.1) {
      // Usuário acelerando - preload mais agressivo
      const strategy = this.strategies.get('fast-scroll')!;
      strategy.maxConcurrent = 6;
      strategy.delay = 25;
    }
  }
}

// Hook para usar o preloader
export const useImagePreloader = () => {
  const preloader = new ImagePreloader();
  
  return {
    preloadByViewport: preloader.preloadByViewport.bind(preloader),
    preloadByPattern: preloader.preloadByPattern.bind(preloader),
    preloadCritical: preloader.preloadCritical.bind(preloader),
    updateScrollBehavior: preloader.updateScrollBehavior.bind(preloader),
    clearQueue: preloader.clearQueue.bind(preloader),
    getStats: preloader.getStats.bind(preloader)
  };
}; 