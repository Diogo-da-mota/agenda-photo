// Logger simples para substituir SecureLogger temporariamente
export const simpleLogger = {
  log: console.log,
  info: console.info,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  
  security: (message: string, data?: any, context?: string) => console.warn(`[SECURITY] ${message}`, data, context),

  audit: {
    log: (message: string, data?: any) => console.info(`[AUDIT] ${message}`, data),
    warn: (message: string, data?: any) => console.warn(`[AUDIT WARNING] ${message}`, data),
    error: (message: string, error?: any, data?: any) => console.error(`[AUDIT ERROR] ${message}`, error, data)
  },

  emDesenvolvimento: import.meta.env.MODE === 'development',
  emProducao: import.meta.env.MODE === 'production'
};