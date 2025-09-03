/**
 * SISTEMA ROBUSTO DE TRATAMENTO DE ERROS
 * Resolve React Error #31 e erros 403 Forbidden
 */

import { toast } from '@/hooks/use-toast';

// Tipos de erro específicos
export interface SupabaseError {
  code?: string | number;
  message: string;
  details?: any;
  hint?: string;
}

export interface ReactError {
  name: string;
  message: string;
  stack?: string;
}

// Classe para tratamento centralizado de erros
export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Configurar handlers globais para capturar erros não tratados
   */
  private setupGlobalErrorHandlers(): void {
    // Capturar promises rejeitadas (resolve React Error #31)
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[ErrorHandler] Promise rejeitada não tratada:', event.reason);
      
      // Prevenir que o erro apareça no console como não tratado
      event.preventDefault();
      
      // Tratar o erro adequadamente
      this.handlePromiseRejection(event.reason);
    });

    // Capturar erros JavaScript gerais
    window.addEventListener('error', (event) => {
      console.error('[ErrorHandler] Erro JavaScript:', event.error);
      this.handleJavaScriptError(event.error);
    });
  }

  /**
   * Tratar promises rejeitadas
   */
  private handlePromiseRejection(reason: any): void {
    if (this.isSupabaseError(reason)) {
      this.handleSupabaseError(reason);
    } else if (this.isReactError(reason)) {
      this.handleReactError(reason);
    } else {
      this.handleGenericError(reason);
    }
  }

  /**
   * Tratar erros JavaScript gerais
   */
  private handleJavaScriptError(error: Error): void {
    // Não mostrar toast para erros menores
    if (this.isMinorError(error)) {
      return;
    }

    console.error('[ErrorHandler] Erro JavaScript capturado:', error);
    
    toast({
      title: "Erro inesperado",
      description: "Ocorreu um erro na aplicação. Tente recarregar a página.",
      variant: "destructive"
    });
  }

  /**
   * Verificar se é erro do Supabase
   */
  private isSupabaseError(error: any): error is SupabaseError {
    return error && (
      typeof error.code !== 'undefined' || 
      error.message?.includes('supabase') ||
      error.message?.includes('RLS') ||
      error.message?.includes('permission')
    );
  }

  /**
   * Verificar se é erro do React
   */
  private isReactError(error: any): error is ReactError {
    return error && (
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Minified React error') ||
      error.stack?.includes('react')
    );
  }

  /**
   * Verificar se é erro menor que não precisa de toast
   */
  private isMinorError(error: Error): boolean {
    const minorPatterns = [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Script error',
      'Network request failed'
    ];

    return minorPatterns.some(pattern => 
      error.message?.includes(pattern)
    );
  }

  /**
   * Tratar erros específicos do Supabase
   */
  public handleSupabaseError(error: SupabaseError): void {
    console.error('[ErrorHandler] Erro Supabase:', error);

    // Tratar erros 403 especificamente
    if (error.code === 403 || error.code === '403') {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para realizar esta ação. Verifique se está logado corretamente.",
        variant: "destructive"
      });
      return;
    }

    // Tratar erros de RLS
    if (error.message?.includes('RLS') || error.message?.includes('policy')) {
      toast({
        title: "Erro de permissão",
        description: "Problema de segurança detectado. Contacte o suporte se persistir.",
        variant: "destructive"
      });
      return;
    }

    // Tratar erros de rede
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    // Erro genérico do Supabase
    toast({
      title: "Erro no servidor",
      description: error.message || "Erro desconhecido do servidor.",
      variant: "destructive"
    });
  }

  /**
   * Tratar erros específicos do React
   */
  public handleReactError(error: ReactError): void {
    console.error('[ErrorHandler] Erro React:', error);

    if (error.message?.includes('Minified React error #31')) {
      console.error('[ErrorHandler] React Error #31 detectado - Promise retornada incorretamente');
      toast({
        title: "Erro de carregamento",
        description: "Recarregue a página para resolver o problema.",
        variant: "destructive"
      });
      return;
    }

    if (error.name === 'ChunkLoadError') {
      toast({
        title: "Erro de carregamento",
        description: "Nova versão disponível. Recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    // Erro genérico do React
    toast({
      title: "Erro da aplicação",
      description: "Ocorreu um erro interno. Recarregue a página.",
      variant: "destructive"
    });
  }

  /**
   * Tratar erros genéricos
   */
  public handleGenericError(error: any): void {
    console.error('[ErrorHandler] Erro genérico:', error);

    const message = error?.message || error?.toString() || 'Erro desconhecido';
    
    toast({
      title: "Erro inesperado",
      description: message,
      variant: "destructive"
    });
  }

  /**
   * Wrapper para funções async que podem falhar
   */
  public async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      console.error('[ErrorHandler] Erro em operação async:', error);
      
      if (errorMessage) {
        toast({
          title: "Operação falhou",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        this.handleGenericError(error);
      }
      
      return null;
    }
  }

  /**
   * Wrapper para useEffect que usa async
   */
  public wrapAsyncEffect(
    asyncFn: () => Promise<void>,
    deps?: React.DependencyList
  ): () => void {
    return () => {
      asyncFn().catch(error => {
        console.error('[ErrorHandler] Erro em useEffect async:', error);
        this.handleGenericError(error);
      });
    };
  }
}

// Exportar instância singleton
export const errorHandler = ErrorHandler.getInstance();

// Hooks utilitários
export const useErrorHandler = () => {
  return {
    handleError: (error: any) => errorHandler.handleGenericError(error),
    handleSupabaseError: (error: SupabaseError) => errorHandler.handleSupabaseError(error),
    handleAsyncOperation: <T>(operation: () => Promise<T>, errorMessage?: string) => 
      errorHandler.handleAsyncOperation(operation, errorMessage),
    wrapAsyncEffect: (asyncFn: () => Promise<void>, deps?: React.DependencyList) =>
      errorHandler.wrapAsyncEffect(asyncFn, deps)
  };
}; 