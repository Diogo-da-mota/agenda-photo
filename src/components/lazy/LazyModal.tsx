import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente para lazy loading de modais com fallback de loading
 */
interface LazyModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyModal: React.FC<LazyModalProps> = ({ 
  isOpen, 
  children, 
  fallback 
}) => {
  // Só renderizar quando o modal estiver aberto
  if (!isOpen) {
    return null;
  }

  const defaultFallback = (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Carregando...</span>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

/**
 * Função utilitária para criar modais lazy carregados
 */
export const createLazyModalComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>
) => {
  return lazy(importFn);
};

export default LazyModal;
