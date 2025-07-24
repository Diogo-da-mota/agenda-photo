import { SecureLogger } from './SecureLogger';

/**
 * Logger específico para eventos de segurança
 * Mascara automaticamente dados sensíveis e logs estruturados
 */
export class SecurityLogger {
  private static instance: SecurityLogger;
  
  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  /**
   * Mascara email para logs seguros
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '[EMAIL_MASKED]';
    
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 2 
      ? `${localPart.substring(0, 2)}***${localPart.slice(-2)}`
      : `${localPart[0]}***`;
    
    const maskedDomain = domain.length > 4
      ? `***${domain.slice(-3)}`
      : '***com';
    
    return `${maskedLocal}@${maskedDomain}`;
  }

  /**
   * Gera hash de usuário para auditoria
   */
  private generateUserHash(email: string): string {
    if (!email) return 'USER_UNKNOWN';
    
    // Simples hash baseado no email para auditoria
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `USER_${Math.abs(hash).toString(16).toUpperCase()}`;
  }

  /**
   * Log de acesso autorizado
   */
  logAuthorizedAccess(route: string, email: string, accessType: 'protected' | 'admin' = 'protected'): void {
    const userHash = this.generateUserHash(email);
    const maskedEmail = this.maskEmail(email);
    
    SecureLogger.info(`Acesso ${accessType} autorizado`, {
      route,
      userHash,
      maskedEmail,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de acesso negado
   */
  logUnauthorizedAccess(route: string, reason: string, email?: string): void {
    const data: any = {
      route,
      reason,
      timestamp: new Date().toISOString()
    };

    if (email) {
      data.userHash = this.generateUserHash(email);
      data.maskedEmail = this.maskEmail(email);
    }

    SecureLogger.warn('Acesso negado', data);
  }

  /**
   * Log de sessão expirada
   */
  logSessionExpired(route: string, email: string): void {
    SecureLogger.warn('Sessão expirada', {
      route,
      userHash: this.generateUserHash(email),
      maskedEmail: this.maskEmail(email),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de atividade suspeita
   */
  logSuspiciousActivity(action: string, details: any, email?: string): void {
    const data: any = {
      action,
      details: this.sanitizeDetails(details),
      timestamp: new Date().toISOString()
    };

    if (email) {
      data.userHash = this.generateUserHash(email);
      data.maskedEmail = this.maskEmail(email);
    }

    SecureLogger.error('Atividade suspeita detectada', data);
  }

  /**
   * Log de operação de login
   */
  logLoginAttempt(email: string, success: boolean, reason?: string): void {
    const userHash = this.generateUserHash(email);
    const maskedEmail = this.maskEmail(email);
    
    if (success) {
      SecureLogger.info('Login bem-sucedido', {
        userHash,
        maskedEmail,
        timestamp: new Date().toISOString()
      });
    } else {
      SecureLogger.warn('Tentativa de login falhada', {
        userHash,
        maskedEmail,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Log de operações de arquivo
   */
  logFileOperation(operation: 'upload' | 'download' | 'delete', filename: string, email: string, success: boolean): void {
    SecureLogger.info(`Operação de arquivo: ${operation}`, {
      operation,
      filename: this.sanitizeFilename(filename),
      userHash: this.generateUserHash(email),
      maskedEmail: this.maskEmail(email),
      success,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Sanitizar detalhes para logs
   */
  private sanitizeDetails(details: any): any {
    if (typeof details === 'string') {
      return details.substring(0, 200); // Limite de caracteres
    }
    
    if (typeof details === 'object' && details !== null) {
      const sanitized: any = {};
      Object.keys(details).forEach(key => {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof details[key] === 'string') {
          sanitized[key] = details[key].substring(0, 100);
        } else {
          sanitized[key] = details[key];
        }
      });
      return sanitized;
    }
    
    return details;
  }

  /**
   * Sanitizar nome de arquivo
   */
  private sanitizeFilename(filename: string): string {
    if (!filename) return '[UNKNOWN_FILE]';
    
    // Remover path completo, manter apenas nome
    const name = filename.split('/').pop() || filename;
    return name.length > 50 ? `${name.substring(0, 47)}...` : name;
  }
}

// Instância singleton
export const securityLogger = SecurityLogger.getInstance();

// Funções de conveniência
export const maskEmail = (email: string): string => {
  return securityLogger['maskEmail'](email);
};

export const generateUserHash = (email: string): string => {
  return securityLogger['generateUserHash'](email);
};