import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Interface para métricas de performance
interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userId?: string;
}

// Thresholds conforme auditoria
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint (substitui FID)
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }  // Time to First Byte
};

// Função para determinar rating da métrica
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// Função para enviar métricas (pode ser integrada com analytics)
const sendMetric = (metric: PerformanceMetric) => {
  // Log local para desenvolvimento
  console.log('[PERFORMANCE]', metric);
  
  // Em produção, enviar para serviço de analytics
  if (process.env.NODE_ENV === 'production') {
    // Exemplo: Google Analytics, Sentry, ou endpoint customizado
    try {
      // Enviar para endpoint de métricas
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      }).catch(err => console.warn('[PERFORMANCE] Falha ao enviar métrica:', err));
    } catch (error) {
      console.warn('[PERFORMANCE] Erro ao enviar métrica:', error);
    }
  }
  
  // Armazenar localmente para debug
  try {
    const metrics = JSON.parse(localStorage.getItem('performance-metrics') || '[]');
    metrics.push(metric);
    // Manter apenas últimas 50 métricas
    if (metrics.length > 50) metrics.splice(0, metrics.length - 50);
    localStorage.setItem('performance-metrics', JSON.stringify(metrics));
  } catch (error) {
    console.warn('[PERFORMANCE] Erro ao armazenar métrica localmente:', error);
  }
};

// Função para criar métrica padronizada
const createMetric = (name: string, value: number, userId?: string): PerformanceMetric => ({
  name,
  value,
  rating: getRating(name, value),
  timestamp: Date.now(),
  url: window.location.pathname,
  userId
});

// Inicializar monitoramento de Web Vitals
export const initWebVitals = (userId?: string) => {
  console.log('[PERFORMANCE] Iniciando monitoramento Web Vitals');
  
  // Largest Contentful Paint
  onLCP((metric) => {
    sendMetric(createMetric('LCP', metric.value, userId));
  });
  
  // Interaction to Next Paint (substitui FID nas versões mais recentes)
  onINP((metric) => {
    sendMetric(createMetric('INP', metric.value, userId));
  });
  
  // Cumulative Layout Shift
  onCLS((metric) => {
    sendMetric(createMetric('CLS', metric.value, userId));
  });
  
  // First Contentful Paint
  onFCP((metric) => {
    sendMetric(createMetric('FCP', metric.value, userId));
  });
  
  // Time to First Byte
  onTTFB((metric) => {
    sendMetric(createMetric('TTFB', metric.value, userId));
  });
};

// Monitoramento de navegação (SPA)
export const trackNavigation = (from: string, to: string, duration: number, userId?: string) => {
  const metric: PerformanceMetric = {
    name: 'NAVIGATION',
    value: duration,
    rating: duration < 300 ? 'good' : duration < 1000 ? 'needs-improvement' : 'poor',
    timestamp: Date.now(),
    url: `${from} -> ${to}`,
    userId
  };
  
  sendMetric(metric);
};

// Monitoramento de renderização de componentes
export const trackComponentRender = (componentName: string, duration: number, userId?: string) => {
  const metric: PerformanceMetric = {
    name: 'COMPONENT_RENDER',
    value: duration,
    rating: duration < 16 ? 'good' : duration < 50 ? 'needs-improvement' : 'poor', // 60fps = 16ms
    timestamp: Date.now(),
    url: `${window.location.pathname}#${componentName}`,
    userId
  };
  
  sendMetric(metric);
};

// Monitoramento de consultas de API
export const trackAPICall = (endpoint: string, duration: number, success: boolean, userId?: string) => {
  const metric: PerformanceMetric = {
    name: success ? 'API_SUCCESS' : 'API_ERROR',
    value: duration,
    rating: duration < 300 ? 'good' : duration < 1000 ? 'needs-improvement' : 'poor',
    timestamp: Date.now(),
    url: endpoint,
    userId
  };
  
  sendMetric(metric);
};

// Função para obter métricas armazenadas localmente
export const getStoredMetrics = (): PerformanceMetric[] => {
  try {
    return JSON.parse(localStorage.getItem('performance-metrics') || '[]');
  } catch {
    return [];
  }
};

// Função para gerar relatório de performance
export const generatePerformanceReport = () => {
  const metrics = getStoredMetrics();
  const report = {
    timestamp: Date.now(),
    url: window.location.pathname,
    summary: {
      total: metrics.length,
      good: metrics.filter(m => m.rating === 'good').length,
      needsImprovement: metrics.filter(m => m.rating === 'needs-improvement').length,
      poor: metrics.filter(m => m.rating === 'poor').length
    },
    averages: {} as Record<string, number>
  };
  
  // Calcular médias por tipo de métrica
  const metricTypes = [...new Set(metrics.map(m => m.name))];
  metricTypes.forEach(type => {
    const typeMetrics = metrics.filter(m => m.name === type);
    if (typeMetrics.length > 0) {
      report.averages[type] = typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length;
    }
  });
  
  console.log('[PERFORMANCE] Relatório gerado:', report);
  return report;
}; 