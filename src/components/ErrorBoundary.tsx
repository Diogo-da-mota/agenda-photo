import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      errorInfo
    });
    
    // Log estruturado do erro
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      // Detectar erros específicos de build/minificação
      isBuildError: error.message.includes('constructor') || 
                   error.message.includes('Minified React error') ||
                   error.message.includes('_e is not'),
      isReactError31: error.message.includes('Minified React error #31')
    };
    
    console.error('🔍 [ErrorBoundary] Detalhes do erro:', errorDetails);
    
    // Para React Error #31, mostrar instruções específicas
    if (errorDetails.isReactError31) {
      console.error('🚨 [ErrorBoundary] React Error #31 detectado - verifique useEffect async');
    }
    
    // Para constructor errors, mostrar instruções específicas  
    if (errorDetails.isBuildError) {
      console.error('🚨 [ErrorBoundary] Constructor/Build error detectado - verifique imports/exports');
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de erro padrão melhorada
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-destructive">
                Oops! Algo deu errado
              </h1>
              <p className="text-muted-foreground">
                Ocorreu um erro inesperado. Por favor, recarregue a página.
              </p>
            </div>
            
            {/* Botão para recarregar */}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Recarregar Página
            </button>
            
            {/* Detalhes do erro em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}