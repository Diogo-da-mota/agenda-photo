import { securityLog } from './securityUtils';

interface SecureError {
  message: string;
  code?: string;
  details?: any;
}

// Mensagens de erro genéricas para produção
const GENERIC_ERRORS = {
  AUTHENTICATION_FAILED: 'Falha na autenticação. Tente novamente.',
  AUTHORIZATION_FAILED: 'Acesso negado.',
  VALIDATION_FAILED: 'Dados inválidos fornecidos.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
  RATE_LIMIT_EXCEEDED: 'Muitas tentativas. Aguarde antes de tentar novamente.',
  FILE_UPLOAD_ERROR: 'Erro no upload do arquivo.',
  DATABASE_ERROR: 'Erro no banco de dados.',
  UNKNOWN_ERROR: 'Erro inesperado. Tente novamente.'
} as const;

/**
 * Manipulador seguro de erros que sanitiza mensagens e registra eventos de segurança
 */
export class SecureErrorHandler {
  private static isProduction = import.meta.env.PROD;

  /**
   * Processa um erro e retorna uma mensagem segura para o usuário
   */
  static handleError(error: any, context?: string): SecureError {
    // Log do erro original para auditoria
    this.logSecurityEvent('ERROR_OCCURRED', {
      context,
      errorType: error?.constructor?.name,
      message: this.isProduction ? 'REDACTED' : error?.message,
      stack: this.isProduction ? 'REDACTED' : error?.stack?.substring(0, 200)
    });

    // Determinar tipo de erro e retornar mensagem segura
    const errorType = this.categorizeError(error);
    const userMessage = this.getSafeErrorMessage(errorType, error);

    return {
      message: userMessage,
      code: errorType,
      details: this.isProduction ? undefined : error?.message
    };
  }

  /**
   * Categoriza o erro baseado em padrões conhecidos
   */
  private static categorizeError(error: any): keyof typeof GENERIC_ERRORS {
    if (!error) return 'UNKNOWN_ERROR';

    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';

    // Erros de autenticação
    if (message.includes('auth') || message.includes('unauthorized') || code.includes('auth')) {
      return 'AUTHENTICATION_FAILED';
    }

    // Erros de autorização
    if (message.includes('permission') || message.includes('forbidden') || message.includes('access')) {
      return 'AUTHORIZATION_FAILED';
    }

    // Erros de validação
    if (message.includes('invalid') || message.includes('validation') || message.includes('required')) {
      return 'VALIDATION_FAILED';
    }

    // Erros de rede
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'NETWORK_ERROR';
    }

    // Rate limiting
    if (message.includes('rate') || message.includes('too many') || message.includes('limit')) {
      return 'RATE_LIMIT_EXCEEDED';
    }

    // Erros de upload
    if (message.includes('upload') || message.includes('file')) {
      return 'FILE_UPLOAD_ERROR';
    }

    // Erros de banco de dados
    if (message.includes('database') || message.includes('sql') || message.includes('query')) {
      return 'DATABASE_ERROR';
    }

    // Erros de servidor
    if (message.includes('server') || message.includes('internal') || code.startsWith('5')) {
      return 'SERVER_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Retorna mensagem segura baseada no tipo de erro
   */
  private static getSafeErrorMessage(errorType: keyof typeof GENERIC_ERRORS, originalError: any): string {
    // Em desenvolvimento, pode mostrar mais detalhes
    if (!this.isProduction && originalError?.message) {
      return `[DEV] ${GENERIC_ERRORS[errorType]} - ${originalError.message}`;
    }

    return GENERIC_ERRORS[errorType];
  }

  /**
   * Registra evento de segurança
   */
  private static logSecurityEvent(event: string, details: any): void {
    securityLog(event, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
      url: window.location.href,
      ...details
    });
  }

  /**
   * Valida se um erro é seguro para mostrar ao usuário
   */
  static isSafeToDisplay(error: any): boolean {
    if (!error?.message) return false;

    const message = error.message.toLowerCase();
    
    // Não mostrar erros que podem vazar informações sensíveis
    const sensitivePatterns = [
      'password',
      'token',
      'key',
      'secret',
      'credential',
      'internal',
      'stack trace',
      'database',
      'sql'
    ];

    return !sensitivePatterns.some(pattern => message.includes(pattern));
  }
}