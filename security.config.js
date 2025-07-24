// Configuração de Segurança - Agenda Pro
export const SECURITY_CONFIG = {
  // Configurações de rate limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo de requisições por IP
    auth: {
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 10 // Máximo de tentativas de login
    }
  },
  
  // Configurações de cookies
  COOKIES: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  },
  
  // Headers de segurança
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  },
  
  // Configurações de CSP
  CSP: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://*.supabase.co"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  },
  
  // Configurações de validação
  VALIDATION: {
    maxPayloadSize: '10kb',
    maxStringLength: 1000,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf'
    ]
  },
  
  // Configurações de auditoria
  AUDIT: {
    enableLogging: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    retentionDays: 90,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'session'
    ]
  }
};

export default SECURITY_CONFIG;
