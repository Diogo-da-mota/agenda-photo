import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary específico para problemas de Portal (Radix UI)
 * Captura erros relacionados a removeChild, portais e DOM
 */
export class PortalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Detectar erros específicos de portal
    const isPortalError = 
      error.message.includes('removeChild') ||
      error.message.includes('Node') ||
      error.message.includes('portal') ||
      error.message.includes('Minified React error #130');

    if (isPortalError) {
      console.warn('🔧 [PortalErrorBoundary] Erro de portal capturado:', error.message);
      return {
        hasError: true,
        error
      };
    }

    // Para outros erros, deixar o ErrorBoundary principal lidar
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔧 [PortalErrorBoundary] Erro capturado:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Tentar limpar portais órfãos
    this.cleanupOrphanedPortals();

    // Callback personalizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  cleanupOrphanedPortals = () => {
    try {
      // Limpar portais Radix UI órfãos
      const portals = document.querySelectorAll('[data-radix-portal]');
      portals.forEach(portal => {
        try {
          if (portal.parentNode && portal.childNodes.length === 0) {
            portal.parentNode.removeChild(portal);
          }
        } catch (cleanupError) {
          // Ignorar erros de limpeza
        }
      });

      // Limpar overlays órfãos
      const overlays = document.querySelectorAll('[data-radix-select-content], [data-radix-dialog-content]');
      overlays.forEach(overlay => {
        try {
          if (overlay.parentNode && !overlay.isConnected) {
            overlay.parentNode.removeChild(overlay);
          }
        } catch (cleanupError) {
          // Ignorar erros de limpeza
        }
      });
    } catch (error) {
      console.warn('🔧 [PortalErrorBoundary] Erro durante limpeza:', error);
    }
  };

  componentWillUnmount() {
    // Limpeza final
    this.cleanupOrphanedPortals();
  }

  render() {
    if (this.state.hasError) {
      // Fallback customizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão para erros de portal
      return (
        <div className="p-2 text-sm text-muted-foreground border border-dashed rounded">
          <span className="text-yellow-600">⚠️</span> Componente temporariamente indisponível
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar o PortalErrorBoundary de forma mais simples
 */
export const withPortalErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <PortalErrorBoundary fallback={fallback}>
      <Component {...props} ref={ref} />
    </PortalErrorBoundary>
  ));
};