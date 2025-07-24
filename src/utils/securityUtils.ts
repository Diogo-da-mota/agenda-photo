import DOMPurify from 'dompurify';

// Utilitários de segurança centralizados e focados

export const SECURITY_CONFIG = {
  MAX_STRING_LENGTH: 1000,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
  MAX_NAME_LENGTH: 100,
  REQUEST_TIMEOUT: 10000,
  RATE_LIMIT_WINDOW: 60000,
  MAX_ATTEMPTS: 5
} as const;

// Sanitização de strings
export const sanitizeInput = (input: unknown): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>\"'&]/g, '') // Remove caracteres perigosos
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim()
    .substring(0, SECURITY_CONFIG.MAX_STRING_LENGTH);
};

// Validação de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= SECURITY_CONFIG.MAX_EMAIL_LENGTH;
};

// Validação de telefone brasileira mais rigorosa
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Opcional
  
  // Remove formatação para validação
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Valida padrões brasileiros: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  const brazilianPhoneRegex = /^(\+55\s?)?\(?[1-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/;
  const numericOnlyRegex = /^[0-9]{10,11}$/;
  
  return (brazilianPhoneRegex.test(phone) || numericOnlyRegex.test(cleanPhone)) && 
         phone.length <= SECURITY_CONFIG.MAX_PHONE_LENGTH;
};

// Rate limiting simples
class SimpleRateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  check(key: string, maxAttempts = SECURITY_CONFIG.MAX_ATTEMPTS): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    // Reset se passou do tempo limite
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { 
        count: 1, 
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW 
      });
      return true;
    }

    // Verificar limite
    if (record.count >= maxAttempts) {
      return false;
    }

    // Incrementar tentativas
    record.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new SimpleRateLimiter();

// Wrapper para timeout em promises
export const withTimeout = <T>(
  promise: Promise<T>, 
  ms: number = SECURITY_CONFIG.REQUEST_TIMEOUT
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), ms)
    )
  ]);
};

// Validação de autenticação
export const validateAuth = (user: any): boolean => {
  return !!(user && user.id && typeof user.id === 'string');
};

// Log de segurança (simplificado) - Dados sensíveis removidos por segurança
export const securityLog = (event: string, details: any = {}): void => {
  // Logs de segurança desabilitados para evitar exposição de dados sensíveis
  // Como tokens CSRF, user agents e outros dados que podem comprometer a segurança
  
  // Log apenas eventos críticos em desenvolvimento (sem dados sensíveis)
  if (import.meta.env.MODE === 'development' && event.includes('ERROR')) {
    console.warn('[SECURITY]', { event: event.replace(/token|csrf|agent/gi, '[MASKED]') });
  }
};

/**
 * Função para sanitizar strings e prevenir ataques XSS
 * 
 * @param input String a ser sanitizada
 * @returns String sanitizada
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input, { USE_PROFILES: { html: false } });
};

/**
 * Função para sanitizar HTML e permitir apenas tags seguras
 * 
 * @param html HTML a ser sanitizado
 * @returns HTML sanitizado
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'option'],
  });
};

/**
 * Função para sanitizar objetos completos
 * 
 * @param obj Objeto a ser sanitizado
 * @returns Objeto com strings sanitizadas
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  if (!obj) return {} as T;
  
  const sanitized = {} as Record<string, any>;
  
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Sanitizar strings
      sanitized[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursivamente sanitizar objetos aninhados
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      // Sanitizar arrays
      sanitized[key] = value.map(item => 
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item)
            : item
      );
    } else {
      // Manter outros tipos de dados intactos
      sanitized[key] = value;
    }
  });
  
  return sanitized as T;
};

/**
 * Função para validar e sanitizar parâmetros de URL
 * 
 * @param param Parâmetro a ser validado
 * @returns Parâmetro sanitizado ou null se inválido
 */
export const validateUrlParam = (param: string | null): string | null => {
  if (!param) return null;
  
  // Remover caracteres perigosos e limitar o tamanho
  const sanitized = sanitizeString(param).substring(0, 100);
  
  // Verificar se o parâmetro contém apenas caracteres seguros
  if (/^[a-zA-Z0-9_\-]+$/.test(sanitized)) {
    return sanitized;
  }
  
  return null;
};

/**
 * Função para prevenir ataques de timing com comparação segura de strings
 * 
 * @param a Primeira string
 * @param b Segunda string
 * @returns Booleano indicando se as strings são iguais
 */
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    // Operação XOR bit a bit - 0 se os caracteres forem iguais
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Função para verificar e validar CSRF token
 * 
 * @param requestToken Token recebido da requisição
 * @param expectedToken Token esperado
 * @returns Booleano indicando se o token é válido
 */
export const validateCsrfToken = (requestToken: string, expectedToken: string): boolean => {
  if (!requestToken || !expectedToken) return false;
  return secureCompare(requestToken, expectedToken);
};

/**
 * Função para validar entrada de email
 * 
 * @param email Email a ser validado
 * @returns Booleano indicando se o email é válido
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Expressão regular para validação básica de email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Função para validar força de senha
 * 
 * @param password Senha a ser validada
 * @returns Objeto com resultado da validação
 */
export const validatePassword = (password: string): { 
  valid: boolean; 
  score: number; 
  message?: string;
} => {
  if (!password) {
    return { valid: false, score: 0, message: 'Senha é obrigatória' };
  }
  
  let score = 0;
  const messages = [];
  
  // Comprimento mínimo
  if (password.length < 8) {
    messages.push('Senha deve ter pelo menos 8 caracteres');
  } else {
    score += 1;
  }
  
  // Letras maiúsculas
  if (!/[A-Z]/.test(password)) {
    messages.push('Senha deve conter pelo menos uma letra maiúscula');
  } else {
    score += 1;
  }
  
  // Letras minúsculas
  if (!/[a-z]/.test(password)) {
    messages.push('Senha deve conter pelo menos uma letra minúscula');
  } else {
    score += 1;
  }
  
  // Números
  if (!/[0-9]/.test(password)) {
    messages.push('Senha deve conter pelo menos um número');
  } else {
    score += 1;
  }
  
  // Caracteres especiais
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    messages.push('Senha deve conter pelo menos um caractere especial');
  } else {
    score += 1;
  }
  
  return {
    valid: score >= 4,
    score,
    message: messages.length > 0 ? messages.join('. ') : undefined
  };
};

// Validação de arquivos aprimorada
export const validateFile = (file: File): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const maxSizeInMB = 10;
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!file) {
    errors.push('Arquivo é obrigatório');
    return { valid: false, errors };
  }
  
  // Validar tipo MIME
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de arquivo não permitido: ${file.type}`);
  }
  
  // Validar tamanho
  if (file.size > maxSizeInMB * 1024 * 1024) {
    errors.push(`Arquivo muito grande. Máximo ${maxSizeInMB}MB`);
  }
  
  // Validar nome do arquivo (caracteres seguros)
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    errors.push('Nome do arquivo contém caracteres inválidos');
  }
  
  // Validar extensão do arquivo
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`Extensão de arquivo não permitida: ${fileExtension}`);
  }
  
  return { valid: errors.length === 0, errors };
};

// Headers de segurança aprimorados
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };
};

// Função para verificar força de autenticação
export const checkAuthenticationStrength = (user: any): {
  score: number;
  issues: string[];
} => {
  const issues: string[] = [];
  let score = 100;
  
  if (!user?.email_confirmed_at) {
    issues.push('Email não confirmado');
    score -= 30;
  }
  
  if (!user?.phone_confirmed_at) {
    issues.push('Telefone não confirmado');
    score -= 20;
  }
  
  // Verificar última atividade
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
  if (lastSignIn) {
    const daysSinceLastSignIn = (Date.now() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastSignIn > 30) {
      issues.push('Última atividade há mais de 30 dias');
      score -= 15;
    }
  }
  
  return { score: Math.max(0, score), issues };
};
