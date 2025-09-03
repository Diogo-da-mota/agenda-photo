import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { preloadCriticalComponents, preloadOnIdle } from '../utils/lazyPreloader';
import { getLazyLoadingConfig, shouldPreloadComponent, getConnectionStrategy } from '../config/lazyLoadingConfig';

/**
 * Hook personalizado para gerenciar lazy loading de forma inteligente e segura
 */
export const useLazyLoading = () => {
  const location = useLocation();

  // Precarrega componentes críticos baseado na rota atual
  useEffect(() => {
    preloadCriticalComponents(location.pathname);
  }, [location.pathname]);

  // Precarrega componentes menos críticos quando o usuário está idle
  useEffect(() => {
    const config = getLazyLoadingConfig();
    const connectionSpeed = getConnectionSpeed();
    
    const idleComponents = [
      { key: 'Reports', importFn: () => import('../pages/Dashboard/Reports') },
      { key: 'HistoricoAtividades', importFn: () => import('../pages/Dashboard/HistoricoAtividades') },
      { key: 'Configuracoes', importFn: () => import('../pages/Dashboard/Configuracoes') },
      { key: 'PortfolioDesign', importFn: () => import('../pages/Dashboard/PortfolioDesign') },
      { key: 'PortfolioIntegracoes', importFn: () => import('../pages/Dashboard/PortfolioIntegracoes') }
    ].filter(component => shouldPreloadComponent(component.key, connectionSpeed, config));

    if (idleComponents.length > 0) {
      preloadOnIdle(idleComponents);
    }
  }, []);

  // Função para precarregar componente específico com configuração
  const preloadComponent = useCallback(async (importFn: () => Promise<any>, componentName: string) => {
    const config = getLazyLoadingConfig();
    const connectionSpeed = getConnectionSpeed();
    
    if (!shouldPreloadComponent(componentName, connectionSpeed, config)) {
      // Log removido para produção - preload pulado
      return;
    }
    
    const strategy = getConnectionStrategy(connectionSpeed, config);
    const maxRetries = strategy.retryAttempts;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = performance.now();
        await importFn();
        const loadTime = performance.now() - startTime;
        
        if (config.monitoring.logPerformance) {
          // Log removido para produção - componente precarregado
        }
        return;
      } catch (error) {
        if (config.monitoring.trackErrors) {
          // Log de erro removido para produção - erro ao precarregar
        }
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        }
      }
    }
  }, []);
  
  // Função auxiliar para obter velocidade da conexão
  const getConnectionSpeed = useCallback(() => {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.effectiveType || 'unknown';
  }, []);

  return {
    preloadComponent,
    currentPath: location.pathname
  };
};

/**
 * Hook para detectar conexão lenta e ajustar estratégia de loading
 */
export const useNetworkAwareLoading = () => {
  const getConnectionSpeed = useCallback(() => {
    // @ts-ignore - navigator.connection pode não estar disponível em todos os navegadores
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
      return 'unknown';
    }

    const effectiveType = connection.effectiveType;
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'slow';
      case '3g':
        return 'medium';
      case '4g':
        return 'fast';
      default:
        return 'unknown';
    }
  }, []);

  const shouldPreload = useCallback(() => {
    const speed = getConnectionSpeed();
    
    // Só precarrega em conexões rápidas ou médias
    return speed === 'fast' || speed === 'medium' || speed === 'unknown';
  }, [getConnectionSpeed]);

  const getLoadingStrategy = useCallback(() => {
    const speed = getConnectionSpeed();
    
    switch (speed) {
      case 'slow':
        return {
          preloadEnabled: false,
          chunkSize: 'minimal',
          priorityOnly: true
        };
      case 'medium':
        return {
          preloadEnabled: true,
          chunkSize: 'medium',
          priorityOnly: false
        };
      case 'fast':
      default:
        return {
          preloadEnabled: true,
          chunkSize: 'full',
          priorityOnly: false
        };
    }
  }, [getConnectionSpeed]);

  return {
    connectionSpeed: getConnectionSpeed(),
    shouldPreload: shouldPreload(),
    loadingStrategy: getLoadingStrategy()
  };
};

/**
 * Hook para monitorar performance do lazy loading
 */
export const useLazyLoadingMetrics = () => {
  const recordLoadTime = useCallback((componentName: string, startTime: number) => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    console.log(`📊 ${componentName} carregado em ${loadTime.toFixed(2)}ms`);
    
    // Envia métricas para analytics (se configurado)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // @ts-ignore
      window.gtag('event', 'lazy_load_performance', {
        component_name: componentName,
        load_time: Math.round(loadTime),
        custom_parameter: 'lazy_loading'
      });
    }
  }, []);

  const trackComponentLoad = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => recordLoadTime(componentName, startTime);
  }, [recordLoadTime]);

  return {
    trackComponentLoad
  };
};