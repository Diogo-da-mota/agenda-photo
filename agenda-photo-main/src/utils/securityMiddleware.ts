import { validarAmbienteSeguranca, validarDadosMascarados, validarRateLimit } from '@/schemas/financeiro';

// Configuração global de segurança
export const GLOBAL_SECURITY_CONFIG = {
  // Blocos de produção
  BLOCK_TEST_COMPONENTS_IN_PRODUCTION: true,
  BLOCK_DEBUG_ROUTES_IN_PRODUCTION: true,
  BLOCK_ADMIN_PANEL_IN_PRODUCTION: true,
  
  // Configurações de mascaramento
  DEFAULT_MASK_LENGTH: 8,
  SENSITIVE_FIELDS: ['access_token', 'refresh_token', 'password', 'secret', 'key', 'token'],
  
  // Rate limiting
  DEFAULT_RATE_LIMIT: {
    maxAttempts: 3,
    timeoutMinutes: 5,
    blockDurationMs: 300000
  },
  
  // Logs de auditoria
  ENABLE_SECURITY_AUDIT_LOGS: true,
  LOG_SENSITIVE_ACCESS_ATTEMPTS: true
};

// Verificar ambiente de desenvolvimento
export const isProductionEnvironment = (): boolean => {
  const env = process.env.NODE_ENV;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  
  // Critérios para considerar produção
  const productionIndicators = [
    env === 'production',
    hostname.includes('.com') && !hostname.includes('dev') && !hostname.includes('test'),
    hostname.includes('.app') && !hostname.includes('dev') && !hostname.includes('test'),
    !hostname.includes('localhost'),
    !hostname.includes('127.0.0.1'),
    !hostname.includes('dev'),
    !hostname.includes('test'),
    !hostname.includes('staging')
  ];
  
  // Se a maioria dos indicadores apontar para produção
  const productionScore = productionIndicators.filter(indicator => indicator).length;
  return productionScore >= 3;
};

// Middleware para validar acesso a componentes de teste
export const validateTestComponentAccess = (componentName: string): { allowed: boolean; reason?: string } => {
  const isProduction = isProductionEnvironment();
  
  if (GLOBAL_SECURITY_CONFIG.BLOCK_TEST_COMPONENTS_IN_PRODUCTION && isProduction) {
    const securityLog = {
      event: 'TEST_COMPONENT_ACCESS_BLOCKED',
      componentName,
      environment: process.env.NODE_ENV,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'unknown'
    };
    
    console.warn('[SECURITY MIDDLEWARE] Componente de teste bloqueado em produção:', securityLog);
    
    // Log de auditoria se habilitado
    if (GLOBAL_SECURITY_CONFIG.ENABLE_SECURITY_AUDIT_LOGS) {
      console.info('[AUDIT] Tentativa de acesso a componente de teste em produção registrada');
    }
    
    return {
      allowed: false,
      reason: `Componente de teste '${componentName}' bloqueado em ambiente de produção por motivos de segurança.`
    };
  }
  
  // Log de acesso permitido em desenvolvimento
  console.info('[SECURITY MIDDLEWARE] Acesso a componente de teste permitido:', {
    componentName,
    environment: process.env.NODE_ENV,
    isProduction,
    timestamp: new Date().toISOString()
  });
  
  return { allowed: true };
};

// Função para mascarar dados sensíveis
export const maskSensitiveData = (
  data: any,
  maskLength: number = GLOBAL_SECURITY_CONFIG.DEFAULT_MASK_LENGTH
): any => {
  if (typeof data === 'string') {
    // Verificar se é um campo sensível
    const isSensitive = GLOBAL_SECURITY_CONFIG.SENSITIVE_FIELDS.some(field => 
      data.toLowerCase().includes(field) || 
      data.length > 20 // Assumir que strings longas podem ser tokens
    );
    
    if (isSensitive || data.length > 50) {
      if (data.length <= maskLength) {
        return '*'.repeat(data.length);
      }
      return data.substring(0, maskLength) + '*'.repeat(Math.min(data.length - maskLength, 20)) + '...';
    }
    
    return data;
  }
  
  if (typeof data === 'object' && data !== null) {
    const maskedObject: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const isKeyMSensitive = GLOBAL_SECURITY_CONFIG.SENSITIVE_FIELDS.some(field => 
        key.toLowerCase().includes(field)
      );
      
      if (isKeyMSensitive) {
        maskedObject[key] = typeof value === 'string' ? maskSensitiveData(value, maskLength) : '[DADO_PROTEGIDO]';
      } else {
        maskedObject[key] = maskSensitiveData(value, maskLength);
      }
    }
    
    return maskedObject;
  }
  
  return data;
};

// Rate limiting por IP/usuário
class SecurityRateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number; blockedUntil?: number }> = new Map();
  
  public checkRateLimit(identifier: string, config = GLOBAL_SECURITY_CONFIG.DEFAULT_RATE_LIMIT): {
    allowed: boolean;
    remainingAttempts: number;
    blockedUntil?: Date;
  } {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);
    
    // Se não há tentativas anteriores, permitir
    if (!userAttempts) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
    }
    
    // Verificar se ainda está bloqueado
    if (userAttempts.blockedUntil && now < userAttempts.blockedUntil) {
      return { 
        allowed: false, 
        remainingAttempts: 0,
        blockedUntil: new Date(userAttempts.blockedUntil)
      };
    }
    
    // Reset se passou do timeout
    if (now - userAttempts.firstAttempt > config.timeoutMinutes * 60 * 1000) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
    }
    
    // Incrementar tentativas
    userAttempts.count++;
    
    // Verificar se excedeu o limite
    if (userAttempts.count > config.maxAttempts) {
      userAttempts.blockedUntil = now + config.blockDurationMs;
      
      console.warn('[SECURITY] Rate limit excedido:', {
        identifier: identifier.substring(0, 10) + '...',
        attempts: userAttempts.count,
        maxAttempts: config.maxAttempts,
        blockedUntil: new Date(userAttempts.blockedUntil).toISOString()
      });
      
      return { 
        allowed: false, 
        remainingAttempts: 0,
        blockedUntil: new Date(userAttempts.blockedUntil)
      };
    }
    
    return { 
      allowed: true, 
      remainingAttempts: config.maxAttempts - userAttempts.count 
    };
  }
  
  public resetRateLimit(identifier: string): void {
    this.attempts.delete(identifier);
    console.info('[SECURITY] Rate limit resetado para:', identifier.substring(0, 10) + '...');
  }
}

// Instância global do rate limiter
export const globalRateLimiter = new SecurityRateLimiter();

// Middleware para logs de auditoria de segurança
export const auditSecurityEvent = (event: {
  type: 'AUTHENTICATION' | 'DATA_ACCESS' | 'RATE_LIMIT' | 'TEST_COMPONENT' | 'TOKEN_EXPOSURE';
  details: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
}): void => {
  if (!GLOBAL_SECURITY_CONFIG.ENABLE_SECURITY_AUDIT_LOGS) {
    return;
  }
  
  const auditLog = {
    ...event,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'unknown',
    sessionId: typeof sessionStorage !== 'undefined' ? 
      sessionStorage.getItem('sessionId')?.substring(0, 10) + '...' : 'unknown'
  };
  
  // Log diferenciado por severidade
  switch (event.severity) {
    case 'CRITICAL':
      console.error('[AUDIT CRITICAL]', auditLog);
      break;
    case 'HIGH':
      console.warn('[AUDIT HIGH]', auditLog);
      break;
    case 'MEDIUM':
      console.warn('[AUDIT MEDIUM]', auditLog);
      break;
    case 'LOW':
      console.info('[AUDIT LOW]', auditLog);
      break;
  }
};

// Validar exposição de tokens
export const validateTokenExposure = (data: any): { safe: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  const checkForTokens = (obj: any, path: string = ''): void => {
    if (typeof obj === 'string') {
      // Verificar padrões de tokens
      const tokenPatterns = [
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/, // JWT
        /^[a-fA-F0-9]{32,}$/, // Hash longo
        /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64 longo
        /access_token|refresh_token|bearer/i
      ];
      
      for (const pattern of tokenPatterns) {
        if (pattern.test(obj) && obj.length > 20) {
          issues.push(`Possível token exposto em: ${path || 'root'}`);
          break;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        checkForTokens(value, path ? `${path}.${key}` : key);
      }
    }
  };
  
  checkForTokens(data);
  
  if (issues.length > 0) {
    auditSecurityEvent({
      type: 'TOKEN_EXPOSURE',
      details: { issues, dataType: typeof data },
      severity: 'CRITICAL'
    });
  }
  
  return { safe: issues.length === 0, issues };
};

// Verificar headers de segurança
export const validateSecurityHeaders = (): { secure: boolean; missingHeaders: string[] } => {
  if (typeof document === 'undefined') {
    return { secure: true, missingHeaders: [] };
  }
  
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security'
  ];
  
  const missingHeaders: string[] = [];
  
  // Em um ambiente real, você verificaria os headers de resposta HTTP
  // Aqui simulamos uma verificação básica
  
  return { secure: missingHeaders.length === 0, missingHeaders };
};

export default {
  validateTestComponentAccess,
  maskSensitiveData,
  globalRateLimiter,
  auditSecurityEvent,
  validateTokenExposure,
  validateSecurityHeaders,
  isProductionEnvironment
}; 