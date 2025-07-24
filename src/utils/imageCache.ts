// Sistema de cache inteligente para imagens
interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

class ImageCache {
  private cache = new Map<string, CachedImage>();
  private maxSize = 50; // Máximo de 50 imagens em cache
  private maxAge = 30 * 60 * 1000; // 30 minutos
  private maxMemory = 100 * 1024 * 1024; // 100MB

  // Obter imagem do cache ou fazer download
  async getImage(url: string): Promise<string> {
    const cached = this.cache.get(url);
    
    // Se existe no cache e não expirou
    if (cached && (Date.now() - cached.timestamp) < this.maxAge) {
      cached.accessCount++;
      cached.lastAccess = Date.now();
      return URL.createObjectURL(cached.blob);
    }

    // Fazer download da imagem
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao carregar imagem');
      
      const blob = await response.blob();
      
      // Adicionar ao cache
      this.addToCache(url, blob);
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn('[ImageCache] Erro ao carregar imagem:', error);
      return url; // Fallback para URL original
    }
  }

  // Adicionar imagem ao cache
  private addToCache(url: string, blob: Blob) {
    // Verificar se precisa limpar cache
    this.cleanup();
    
    const now = Date.now();
    this.cache.set(url, {
      url,
      blob,
      timestamp: now,
      accessCount: 1,
      lastAccess: now
    });
  }

  // Limpeza inteligente do cache
  private cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remover imagens expiradas
    entries.forEach(([url, cached]) => {
      if (now - cached.timestamp > this.maxAge) {
        this.cache.delete(url);
      }
    });

    // Se ainda está acima do limite, remover as menos usadas
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([_, cached]) => now - cached.timestamp <= this.maxAge)
        .sort((a, b) => {
          // Priorizar por frequência de acesso e recência
          const scoreA = a[1].accessCount * (1 / (now - a[1].lastAccess));
          const scoreB = b[1].accessCount * (1 / (now - b[1].lastAccess));
          return scoreA - scoreB;
        });

      // Remover as menos importantes
      const toRemove = sortedEntries.slice(0, Math.floor(this.maxSize * 0.3));
      toRemove.forEach(([url]) => this.cache.delete(url));
    }

    // Verificar uso de memória (estimativa)
    const totalSize = entries.reduce((sum, [_, cached]) => sum + cached.blob.size, 0);
    if (totalSize > this.maxMemory) {
      // Remover imagens maiores primeiro
      const sortedBySize = entries
        .sort((a, b) => b[1].blob.size - a[1].blob.size)
        .slice(0, Math.floor(entries.length * 0.2));
      
      sortedBySize.forEach(([url]) => this.cache.delete(url));
    }
  }

  // Pré-carregar imagens importantes
  async preloadImages(urls: string[], priority: 'high' | 'low' = 'low') {
    const promises = urls.map(async (url) => {
      if (!this.cache.has(url)) {
        try {
          await this.getImage(url);
        } catch (error) {
          console.warn('[ImageCache] Erro no preload:', error);
        }
      }
    });

    if (priority === 'high') {
      await Promise.all(promises);
    } else {
      // Para prioridade baixa, não bloquear
      Promise.all(promises).catch(() => {});
    }
  }

  // Limpar cache manualmente
  clear() {
    this.cache.clear();
  }

  // Verificar se imagem está em cache
  isImageCached(url: string): boolean {
    const cached = this.cache.get(url);
    return cached !== undefined && (Date.now() - cached.timestamp) < this.maxAge;
  }

  // Obter estatísticas do cache
  getStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, cached) => sum + cached.blob.size, 0);
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalMemory: totalSize,
      maxMemory: this.maxMemory,
      hitRate: entries.reduce((sum, cached) => sum + cached.accessCount, 0) / entries.length || 0
    };
  }
}

// Instância global do cache
export const imageCache = new ImageCache();

// Hook para usar o cache de imagens
export const useImageCache = () => {
  return {
    getImage: (url: string) => imageCache.getImage(url),
    preloadImages: (urls: string[], priority?: 'high' | 'low') => 
      imageCache.preloadImages(urls, priority),
    isImageCached: (url: string) => imageCache.isImageCached(url),
    getStats: () => imageCache.getStats(),
    clear: () => imageCache.clear()
  };
};

// Função para otimizar URLs de imagem (adicionar parâmetros de qualidade)
export const optimizeImageUrl = (url: string | null | undefined, width?: number, height?: number, quality = 80): string => {
  // Se a URL for nula, indefinida ou vazia, retorna um placeholder
  if (!url) {
    return '/placeholder.svg'; 
  }

  // Se for URL do Supabase Storage, adicionar parâmetros de transformação
  if (url.includes('supabase.co/storage')) {
    try {
      const urlObject = new URL(url);
      const params = new URLSearchParams(urlObject.search);
      
      if (width) params.set('width', width.toString());
      if (height) params.set('height', height.toString());
      if (!params.has('quality')) params.set('quality', quality.toString());
      if (!params.has('format')) params.set('format', 'webp');

      urlObject.search = params.toString();
      return urlObject.toString();
    } catch (error) {
      // Retorna a URL original se houver erro na manipulação
      return url;
    }
  }
  
  return url;
};

// Função para detectar se o navegador suporta WebP
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}; 