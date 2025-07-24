/**
 * Sistema de preload inteligente para componentes lazy
 * Melhora a performance carregando componentes antes que sejam necessários
 */

// Cache de componentes precarregados
const preloadCache = new Map<string, Promise<any>>();

/**
 * Precarrega um componente lazy de forma segura
 */
export const preloadComponent = async (importFn: () => Promise<any>, key: string): Promise<void> => {
  try {
    // Verifica se já está no cache
    if (preloadCache.has(key)) {
      return;
    }

    // Adiciona ao cache e executa o preload
    const preloadPromise = importFn();
    preloadCache.set(key, preloadPromise);
    
    await preloadPromise;
    console.log(`✅ Componente ${key} precarregado com sucesso`);
  } catch (error) {
    console.warn(`⚠️ Falha ao precarregar componente ${key}:`, error);
    // Remove do cache em caso de erro
    preloadCache.delete(key);
  }
};

/**
 * Precarrega componentes críticos baseado na rota atual
 */
export const preloadCriticalComponents = (currentPath: string): void => {
  // Preload baseado na rota atual
  if (currentPath === '/') {
    // Na landing page, precarrega Dashboard
    preloadComponent(() => import('../pages/Dashboard/Dashboard'), 'Dashboard');
  } else if (currentPath.startsWith('/dashboard')) {
    // No dashboard, precarrega componentes relacionados
    preloadComponent(() => import('../pages/Dashboard/Clientes'), 'Clientes');
    preloadComponent(() => import('../pages/Dashboard/Agenda'), 'Agenda');
    preloadComponent(() => import('../pages/Dashboard/Portfolio'), 'Portfolio');
  } else if (currentPath.startsWith('/clientes')) {
    // Na página de clientes, precarrega contratos e financeiro
    preloadComponent(() => import('../pages/Dashboard/Contratos'), 'Contratos');
    preloadComponent(() => import('../pages/Dashboard/Financeiro'), 'Financeiro');
  }
};

/**
 * Precarrega componentes com base na interação do usuário
 */
export const preloadOnHover = (componentKey: string, importFn: () => Promise<any>) => {
  return {
    onMouseEnter: () => preloadComponent(importFn, componentKey),
    onFocus: () => preloadComponent(importFn, componentKey)
  };
};

/**
 * Precarrega componentes quando o usuário está idle
 */
export const preloadOnIdle = (components: Array<{ key: string; importFn: () => Promise<any> }>) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      components.forEach(({ key, importFn }) => {
        preloadComponent(importFn, key);
      });
    }, { timeout: 5000 });
  } else {
    // Fallback para navegadores que não suportam requestIdleCallback
    setTimeout(() => {
      components.forEach(({ key, importFn }) => {
        preloadComponent(importFn, key);
      });
    }, 2000);
  }
};

/**
 * Limpa o cache de preload (útil para desenvolvimento)
 */
export const clearPreloadCache = (): void => {
  preloadCache.clear();
  console.log('🧹 Cache de preload limpo');
};

/**
 * Retorna estatísticas do cache de preload
 */
export const getPreloadStats = () => {
  return {
    cachedComponents: preloadCache.size,
    componentKeys: Array.from(preloadCache.keys())
  };
};