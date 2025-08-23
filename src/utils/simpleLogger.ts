// Logger simples para substituir SecureLogger temporariamente
const isDevelopment = import.meta.env.MODE === 'development';

export const simpleLogger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  security: (message: string, data?: any, context?: string) => {
    if (isDevelopment) {
      console.warn(`[SECURITY] ${message}`, data, context);
    }
  },

  audit: {
    log: (message: string, data?: any) => {
      if (isDevelopment) {
        console.info(`[AUDIT] ${message}`, data);
      }
    },
    warn: (message: string, data?: any) => {
      if (isDevelopment) {
        console.warn(`[AUDIT WARNING] ${message}`, data);
      }
    },
    error: (message: string, error?: any, data?: any) => {
      if (isDevelopment) {
        console.error(`[AUDIT ERROR] ${message}`, error, data);
      }
    }
  },

  emDesenvolvimento: isDevelopment,
  emProducao: !isDevelopment
};