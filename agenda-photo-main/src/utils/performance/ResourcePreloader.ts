/**
 * Sistema de preload inteligente de recursos críticos
 * Carrega recursos importantes antecipadamente para melhor performance
 */

export interface PreloadResource {
  href: string;
  as: 'script' | 'style' | 'font' | 'image' | 'fetch';
  type?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
  priority?: 'high' | 'low';
}

export interface PreloadConfig {
  critical: PreloadResource[];
  important: PreloadResource[];
  optional: PreloadResource[];
}

class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private config: PreloadConfig;

  constructor() {
    this.config = {
      critical: [
        // CSS crítico
        {
          href: '/src/index.css',
          as: 'style',
          priority: 'high'
        },
        // Fontes principais
        {
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          as: 'style',
          crossorigin: 'anonymous',
          priority: 'high'
        }
      ],
      important: [
        // Imagens do logo e placeholders
        {
          href: '/placeholder.svg',
          as: 'image',
          priority: 'high'
        },
        {
          href: '/favicon.ico',
          as: 'image',
          priority: 'low'
        }
      ],
      optional: [
        // APIs importantes
        {
          href: '/api/perfis',
          as: 'fetch',
          crossorigin: 'anonymous',
          priority: 'low'
        }
      ]
    };
  }

  /**
   * Preload de recursos críticos (executar imediatamente)
   */
  preloadCritical(): void {
    this.config.critical.forEach(resource => {
      this.preloadResource(resource);
    });
  }

  /**
   * Preload de recursos importantes (executar após carregamento inicial)
   */
  preloadImportant(): void {
    requestIdleCallback(() => {
      this.config.important.forEach(resource => {
        this.preloadResource(resource);
      });
    });
  }

  /**
   * Preload de recursos opcionais (executar quando houver tempo)
   */
  preloadOptional(): void {
    setTimeout(() => {
      this.config.optional.forEach(resource => {
        this.preloadResource(resource);
      });
    }, 2000);
  }

  /**
   * Preload de uma rota específica
   */
  preloadRoute(routePath: string): void {
    const routeResources = this.getRouteResources(routePath);
    
    routeResources.forEach(resource => {
      this.preloadResource(resource);
    });
  }

  /**
   * Preload baseado na interação do usuário (hover, focus)
   */
  preloadOnInteraction(element: HTMLElement, resources: PreloadResource[]): void {
    let preloaded = false;

    const handleInteraction = () => {
      if (!preloaded) {
        resources.forEach(resource => {
          this.preloadResource(resource);
        });
        preloaded = true;
      }
    };

    // Preload no hover ou focus
    element.addEventListener('mouseenter', handleInteraction, { once: true });
    element.addEventListener('focus', handleInteraction, { once: true });
    
    // Preload automático após 3 segundos se não houver interação
    setTimeout(() => {
      if (!preloaded) {
        handleInteraction();
      }
    }, 3000);
  }

  /**
   * Preload inteligente baseado na largura de banda
   */
  intelligentPreload(): void {
    // @ts-ignore - Navigator connection não é padrão em todos os browsers
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const { effectiveType, saveData } = connection;
      
      // Se o usuário tem "save data" ativo, não fazer preload opcional
      if (saveData) {
        console.log('Save Data ativo - Preload limitado');
        this.preloadCritical();
        return;
      }
      
      // Preload baseado na velocidade da conexão
      switch (effectiveType) {
        case '4g':
          this.preloadCritical();
          this.preloadImportant();
          this.preloadOptional();
          break;
        case '3g':
          this.preloadCritical();
          this.preloadImportant();
          break;
        case '2g':
        case 'slow-2g':
          this.preloadCritical();
          break;
        default:
          this.preloadCritical();
          this.preloadImportant();
      }
    } else {
      // Fallback se não conseguir detectar a conexão
      this.preloadCritical();
      this.preloadImportant();
    }
  }

  /**
   * Adicionar resource hints ao head
   */
  addResourceHints(): void {
    const head = document.head;
    
    // DNS prefetch para domínios externos
    const dnsPrefetches = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.supabase.co'
    ];
    
    dnsPrefetches.forEach(domain => {
      if (!document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        head.appendChild(link);
      }
    });

    // Preconnect para recursos críticos
    const preconnects = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];
    
    preconnects.forEach(domain => {
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        head.appendChild(link);
      }
    });
  }

  /**
   * Obter recursos específicos de uma rota
   */
  private getRouteResources(routePath: string): PreloadResource[] {
    const routeResourceMap: Record<string, PreloadResource[]> = {
      '/dashboard': [
        { href: '/api/financeiro/resumo', as: 'fetch', crossorigin: 'anonymous' },
        { href: '/api/portfolio/trabalhos', as: 'fetch', crossorigin: 'anonymous' }
      ],
      '/portfolio': [
        { href: '/api/portfolio/trabalhos', as: 'fetch', crossorigin: 'anonymous' },
        { href: '/api/portfolio/imagens', as: 'fetch', crossorigin: 'anonymous' }
      ],
      '/financeiro': [
        { href: '/api/financeiro/transacoes', as: 'fetch', crossorigin: 'anonymous' },
        { href: '/api/financeiro/categorias', as: 'fetch', crossorigin: 'anonymous' }
      ],
      '/agenda': [
        { href: '/api/agenda/eventos', as: 'fetch', crossorigin: 'anonymous' }
      ],
      '/clientes': [
        { href: '/api/clientes', as: 'fetch', crossorigin: 'anonymous' }
      ]
    };

    return routeResourceMap[routePath] || [];
  }

  /**
   * Preload de um recurso individual
   */
  private preloadResource(resource: PreloadResource): void {
    // Evitar preload duplicado
    if (this.preloadedResources.has(resource.href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.type) {
      link.type = resource.type;
    }
    
    if (resource.crossorigin) {
      link.crossOrigin = resource.crossorigin;
    }

    // Adicionar ao head
    document.head.appendChild(link);
    
    // Marcar como preloaded
    this.preloadedResources.add(resource.href);
    
    // Log apenas em desenvolvimento para evitar poluir console em produção
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PRELOADER] ${resource.href} (${resource.as})`);
    }
  }

  /**
   * Limpar preloads desnecessários
   */
  cleanup(): void {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    
    preloadLinks.forEach(link => {
      // Remover preloads antigos (mais de 5 minutos)
      const linkElement = link as HTMLLinkElement;
      const href = linkElement.href;
      
      // Se o recurso já foi carregado, remover o preload
      if (this.isResourceLoaded(href)) {
        link.remove();
        this.preloadedResources.delete(href);
      }
    });
  }

  /**
   * Verificar se um recurso já foi carregado
   */
  private isResourceLoaded(href: string): boolean {
    // Verificar se existe script/style/img com este src/href
    const selectors = [
      `script[src="${href}"]`,
      `link[href="${href}"]`,
      `img[src="${href}"]`
    ];
    
    return selectors.some(selector => document.querySelector(selector) !== null);
  }
}

// Instância singleton
export const resourcePreloader = new ResourcePreloader();

/**
 * Hook para usar preloader em componentes React
 */
export function useResourcePreloader() {
  const preloadRoute = (routePath: string) => {
    resourcePreloader.preloadRoute(routePath);
  };

  const preloadOnHover = (element: HTMLElement, resources: PreloadResource[]) => {
    resourcePreloader.preloadOnInteraction(element, resources);
  };

  return {
    preloadRoute,
    preloadOnHover,
    preloader: resourcePreloader
  };
}

/**
 * Inicializar preloader automaticamente
 */
export function initResourcePreloader() {
  // Adicionar resource hints
  resourcePreloader.addResourceHints();
  
  // Preload inteligente baseado na conexão
  resourcePreloader.intelligentPreload();
  
  // Cleanup periódico
  setInterval(() => {
    resourcePreloader.cleanup();
  }, 5 * 60 * 1000); // A cada 5 minutos
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[PRELOADER] Resource Preloader inicializado');
  }
} 