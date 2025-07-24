
/**
 * Sistema de performance simplificado
 * Versão básica sem dependências externas
 */

export const initSimplePerformance = () => {
  try {
    // Performance básica do navegador
    if (typeof window !== 'undefined' && window.performance) {
      console.log('[PERFORMANCE] Sistema básico inicializado');
      
      // Log simples de tempo de carregamento
      window.addEventListener('load', () => {
        const loadTime = window.performance.now();
        console.log(`[PERFORMANCE] Página carregada em ${loadTime.toFixed(2)}ms`);
      });
    }
  } catch (error) {
    console.warn('[PERFORMANCE] Erro ao inicializar monitoramento:', error);
  }
};

export const logPerformance = (name: string, value: number) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[PERFORMANCE] ${name}: ${value}ms`);
  }
};
