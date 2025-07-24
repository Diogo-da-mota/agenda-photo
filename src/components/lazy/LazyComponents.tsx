import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

/**
 * Componentes lazy para code splitting
 * Reduz o bundle inicial carregando componentes sob demanda
 */

// Loading fallback otimizado
const LoadingFallback = ({ message = "Carregando..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground">{message}</p>
    <div className="w-full max-w-md space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

// Páginas principais (lazy loaded)
export const LazyDashboard = lazy(() => 
  import('@/pages/Dashboard/Dashboard').then(module => ({
    default: module.default
  }))
);

export const LazyPortfolio = lazy(() => 
  import('@/pages/Dashboard/Portfolio').then(module => ({
    default: module.default
  }))
);

export const LazyFinanceiro = lazy(() => 
  import('@/pages/Dashboard/Financeiro').then(module => ({
    default: module.default
  }))
);

export const LazyAgenda = lazy(() => 
  import('@/pages/Dashboard/Agenda').then(module => ({
    default: module.default
  }))
);

export const LazyClientes = lazy(() => 
  import('@/pages/Dashboard/Clientes').then(module => ({
    default: module.default
  }))
);

export const LazyConfiguracoes = lazy(() => 
  import('@/pages/Dashboard/Configuracoes').then(module => ({
    default: module.default
  }))
);

// Componentes pesados (lazy loaded)
export const LazyImageGallery = lazy(() => 
  import('@/components/optimized/OptimizedImageGallery').then(module => ({
    default: module.default
  }))
);

// HOC para wrapper com Suspense
export function withLazyLoading<T = any>(
  Component: React.LazyExoticComponent<React.ComponentType<T>>,
  fallbackMessage?: string
) {
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
        <Component {...(props as any)} />
      </Suspense>
    );
  };
}

// Componentes prontos para uso
export const Dashboard = withLazyLoading(LazyDashboard, "Carregando dashboard...");
export const Portfolio = withLazyLoading(LazyPortfolio, "Carregando portfólio...");
export const Financeiro = withLazyLoading(LazyFinanceiro, "Carregando financeiro...");
export const Agenda = withLazyLoading(LazyAgenda, "Carregando agenda...");
export const Clientes = withLazyLoading(LazyClientes, "Carregando clientes...");
export const Configuracoes = withLazyLoading(LazyConfiguracoes, "Carregando configurações...");
export const ImageGallery = withLazyLoading(LazyImageGallery, "Carregando galeria...");

/**
 * Utilitário para preload de componentes
 */
export const preloadComponents = {
  dashboard: () => import('@/pages/Dashboard/Dashboard'),
  portfolio: () => import('@/pages/Dashboard/Portfolio'),
  financeiro: () => import('@/pages/Dashboard/Financeiro'),
  agenda: () => import('@/pages/Dashboard/Agenda'),
  clientes: () => import('@/pages/Dashboard/Clientes'),
  configuracoes: () => import('@/pages/Dashboard/Configuracoes'),
  imageGallery: () => import('@/components/optimized/OptimizedImageGallery')
};

/**
 * Preload inteligente baseado na rota atual
 */
export const intelligentPreload = (currentRoute: string) => {
  const preloadMap: Record<string, (() => Promise<any>)[]> = {
    '/dashboard': [
      preloadComponents.portfolio,
      preloadComponents.financeiro
    ],
    '/portfolio': [
      preloadComponents.imageGallery,
      preloadComponents.dashboard
    ],
    '/financeiro': [
      preloadComponents.dashboard,
      preloadComponents.portfolio
    ],
    '/agenda': [
      preloadComponents.clientes,
      preloadComponents.dashboard
    ],
    '/clientes': [
      preloadComponents.agenda,
      preloadComponents.dashboard
    ]
  };

  const componentsToPreload = preloadMap[currentRoute] || [];
  
  // Preload com delay para não impactar a rota atual
  setTimeout(() => {
    componentsToPreload.forEach(preloadFn => {
      preloadFn().catch(error => {
        console.warn('Falha no preload:', error);
      });
    });
  }, 1000);
}; 