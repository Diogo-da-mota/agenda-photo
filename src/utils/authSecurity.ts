/**
 * Gera um token CSRF seguro
 */
export const generateCSRFToken = (): string => {
  // Usar Web Crypto API para gerar bytes aleatórios seguros
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback para Node.js ou ambientes sem Web Crypto API
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2);
  return btoa(`${timestamp}-${randomString}`).replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Valida origem da requisição
 */
export const validateOrigin = (origin: string, allowedOrigins: string[]): boolean => {
  if (!origin) return false;
  
  // Permitir localhost em desenvolvimento
  if (import.meta.env.DEV && origin.includes('localhost')) {
    return true;
  }
  
  return allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith(`.${allowed}`)
  );
};

/**
 * Gera nonce para CSP
 */
export const generateNonce = (): string => {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }
  
  // Fallback
  return btoa(Math.random().toString()).substring(0, 22);
};

/**
 * Sanitiza headers para log de segurança
 */
export const sanitizeHeaders = (headers: Record<string, string>): Record<string, string> => {
  const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie', 'x-csrf-token'];
  const sanitized: Record<string, string> = {};
  
  Object.entries(headers).forEach(([key, value]) => {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

/**
 * Valida taxa de requisições por IP
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutos
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove requisições antigas
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

/**
 * Instância global do rate limiter
 */
export const globalRateLimiter = new RateLimiter();

/**
 * Valida entrada de dados contra XSS
 */
export const validateInput = (input: unknown): boolean => {
  if (typeof input !== 'string') return true;
  
  // Detectar scripts maliciosos
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi
  ];
  
  return !xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Registra tentativa de login falhada
 */
export const recordFailedLogin = (identifier: string): void => {
  const key = `failed_login_${identifier}`;
  const attempts = parseInt(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, attempts.toString());
  localStorage.setItem(`${key}_time`, Date.now().toString());
};

/**
 * Registra login bem-sucedido
 */
export const recordSuccessfulLogin = (identifier: string): void => {
  const key = `failed_login_${identifier}`;
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}_time`);
};

/**
 * Verifica se usuário está bloqueado por tentativas excessivas
 */
export const isBlocked = (identifier: string): boolean => {
  const key = `failed_login_${identifier}`;
  const attempts = parseInt(localStorage.getItem(key) || '0');
  const lastAttempt = parseInt(localStorage.getItem(`${key}_time`) || '0');
  
  const maxAttempts = 5;
  const blockDuration = 15 * 60 * 1000; // 15 minutos
  
  if (attempts >= maxAttempts) {
    const timeSinceLastAttempt = Date.now() - lastAttempt;
    return timeSinceLastAttempt < blockDuration;
  }
  
  return false;
};

/**
 * Detecta atividade suspeita
 */
export const detectSuspiciousActivity = (userAgent: string, ip?: string): boolean => {
  // Detectar bots ou ferramentas automatizadas
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /curl/i,
    /wget/i,
    /postman/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
};

/**
 * Verifica se sessão está próxima do vencimento
 */
export const isSessionNearExpiry = (session: any, warningMinutes: number = 5): boolean => {
  if (!session?.expires_at) return false;
  
  const expiryTime = new Date(session.expires_at).getTime();
  const warningTime = warningMinutes * 60 * 1000;
  return (expiryTime - Date.now()) <= warningTime;
};

/**
 * Força logout seguro
 */
export const forceSecureLogout = async (reason?: string): Promise<void> => {
  console.log(`Secure logout triggered: ${reason || 'Unknown reason'}`);
  
  // Limpar dados sensíveis do localStorage
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('session') ||
    key.includes('token')
  );
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Limpar sessionStorage
  sessionStorage.clear();
  
  // Redirecionar para login
  if (typeof window !== 'undefined') {
    window.location.href = '/auth';
  }
};