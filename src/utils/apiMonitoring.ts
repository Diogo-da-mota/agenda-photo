import { trackAPICall } from './performance';

// Interface para métricas de API
interface APIMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
  timestamp: number;
  userId?: string;
  error?: string;
}

// Thresholds para alertas
const API_THRESHOLDS = {
  SLOW_REQUEST: 300, // ms
  VERY_SLOW_REQUEST: 1000, // ms
  ERROR_RATE_THRESHOLD: 0.1 // 10%
};

// Armazenamento de métricas de API
let apiMetrics: APIMetric[] = [];

// Função para adicionar métrica de API
const addAPIMetric = (metric: APIMetric) => {
  apiMetrics.push(metric);
  
  // Manter apenas últimas 100 métricas
  if (apiMetrics.length > 100) {
    apiMetrics = apiMetrics.slice(-100);
  }
  
  // Verificar alertas
  checkAPIAlerts(metric);
  
  // Registrar no sistema de performance
  trackAPICall(metric.endpoint, metric.duration, metric.success, metric.userId);
};

// Verificar alertas de API
const checkAPIAlerts = (metric: APIMetric) => {
  // Alerta para requisições lentas
  if (metric.duration > API_THRESHOLDS.SLOW_REQUEST) {
    const severity = metric.duration > API_THRESHOLDS.VERY_SLOW_REQUEST ? 'ERROR' : 'WARNING';
    console.warn(`[API_ALERT] ${severity}: Requisição lenta detectada`, {
      endpoint: metric.endpoint,
      duration: `${metric.duration}ms`,
      threshold: `${API_THRESHOLDS.SLOW_REQUEST}ms`,
      method: metric.method
    });
  }
  
  // Calcular taxa de erro das últimas 10 requisições para o mesmo endpoint
  const recentMetrics = apiMetrics
    .filter(m => m.endpoint === metric.endpoint)
    .slice(-10);
    
  if (recentMetrics.length >= 5) {
    const errorRate = recentMetrics.filter(m => !m.success).length / recentMetrics.length;
    
    if (errorRate > API_THRESHOLDS.ERROR_RATE_THRESHOLD) {
      console.error(`[API_ALERT] ERROR: Alta taxa de erro detectada`, {
        endpoint: metric.endpoint,
        errorRate: `${Math.round(errorRate * 100)}%`,
        threshold: `${API_THRESHOLDS.ERROR_RATE_THRESHOLD * 100}%`,
        recentRequests: recentMetrics.length
      });
    }
  }
};

// Interceptor para fetch (usado pelo Supabase)
const originalFetch = window.fetch;

window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const startTime = performance.now();
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method || 'GET';
  
  try {
    const response = await originalFetch(input, init);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Só monitorar requisições do Supabase
    if (url.includes('supabase.co') || url.includes('/rest/v1/')) {
      const metric: APIMetric = {
        endpoint: url,
        method,
        duration,
        status: response.status,
        success: response.ok,
        timestamp: Date.now()
      };
      
      addAPIMetric(metric);
    }
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Registrar erro
    if (url.includes('supabase.co') || url.includes('/rest/v1/')) {
      const metric: APIMetric = {
        endpoint: url,
        method,
        duration,
        status: 0,
        success: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      addAPIMetric(metric);
    }
    
    throw error;
  }
};

// Função para obter estatísticas de API
export const getAPIStats = () => {
  if (apiMetrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      successRate: 0,
      slowRequests: 0,
      errorRate: 0
    };
  }
  
  const totalRequests = apiMetrics.length;
  const successfulRequests = apiMetrics.filter(m => m.success).length;
  const slowRequests = apiMetrics.filter(m => m.duration > API_THRESHOLDS.SLOW_REQUEST).length;
  const averageResponseTime = apiMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
  
  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    successRate: Math.round((successfulRequests / totalRequests) * 100),
    slowRequests,
    errorRate: Math.round(((totalRequests - successfulRequests) / totalRequests) * 100)
  };
};

// Função para obter métricas por endpoint
export const getEndpointStats = () => {
  const endpointMap = new Map<string, APIMetric[]>();
  
  apiMetrics.forEach(metric => {
    const endpoint = metric.endpoint.split('?')[0]; // Remover query params
    if (!endpointMap.has(endpoint)) {
      endpointMap.set(endpoint, []);
    }
    endpointMap.get(endpoint)!.push(metric);
  });
  
  const stats = Array.from(endpointMap.entries()).map(([endpoint, metrics]) => {
    const totalRequests = metrics.length;
    const successfulRequests = metrics.filter(m => m.success).length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    
    return {
      endpoint,
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      successRate: Math.round((successfulRequests / totalRequests) * 100),
      lastRequest: Math.max(...metrics.map(m => m.timestamp))
    };
  });
  
  return stats.sort((a, b) => b.totalRequests - a.totalRequests);
};

// Função para limpar métricas
export const clearAPIMetrics = () => {
  apiMetrics = [];
  console.log('[API_MONITORING] Métricas de API limpas');
};

// Função para exportar métricas
export const exportAPIMetrics = () => {
  return {
    metrics: [...apiMetrics],
    stats: getAPIStats(),
    endpointStats: getEndpointStats(),
    timestamp: Date.now()
  };
};

// Inicializar monitoramento
// console.log('[API_MONITORING] Sistema de monitoramento de API inicializado'); // Removido para produção

// Expor funções globalmente para debug
if (process.env.NODE_ENV === 'development') {
  (window as any).apiMonitoring = {
    getStats: getAPIStats,
    getEndpointStats: getEndpointStats,
    clearMetrics: clearAPIMetrics,
    exportMetrics: exportAPIMetrics
  };
}