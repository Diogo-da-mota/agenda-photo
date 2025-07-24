import { LogLevel, LogLevels, LoggerConfig } from '@/types/logging';
import { loggingConfig } from '@/config/logging.config';
import { SENSITIVE_PATTERNS } from './SecurityPatterns';

/**
 * Logger seguro com mascaramento automático de dados sensíveis
 */
class SecureLoggerImpl {
  private config: LoggerConfig;
  private isProduction: boolean;

  constructor() {
    const env = this.detectEnvironment();
    this.config = loggingConfig[env] || loggingConfig.default;
    this.isProduction = env === 'production';
  }

  // Métodos de conveniência para compatibilidade
  log = (...args: any[]) => this.info(args[0], args.slice(1));
  
  // Propriedades para compatibilidade com código existente
  security = {
    log: (message: string, data?: any) => this.warn(`[SECURITY] ${message}`, data),
    warn: (message: string, data?: any) => this.warn(`[SECURITY WARNING] ${message}`, data),
    error: (message: string, error?: any, data?: any) => this.error(`[SECURITY ERROR] ${message}`, error, data)
  };

  audit = {
    log: (message: string, data?: any) => this.info(`[AUDIT] ${message}`, data),
    warn: (message: string, data?: any) => this.warn(`[AUDIT WARNING] ${message}`, data),
    error: (message: string, error?: any, data?: any) => this.error(`[AUDIT ERROR] ${message}`, error, data)
  };

  emDesenvolvimento = import.meta.env.MODE === 'development';
  emProducao = import.meta.env.MODE === 'production';

  private detectEnvironment(): keyof typeof loggingConfig {
    if (typeof window === 'undefined') return 'default';
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    if (hostname.includes('staging') || hostname.includes('dev')) {
      return 'staging';
    }
    return 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.config.disableLogs) return false;
    return LogLevels[level] >= LogLevels[this.config.level];
  }

  private maskSensitiveData(data: any): any {
    if (!this.config.maskData) return data;
    
    if (typeof data === 'string') {
      let masked = data;
      Object.entries(SENSITIVE_PATTERNS).forEach(([type, pattern]) => {
        masked = masked.replace(pattern, `[${type.toUpperCase()}_MASKED]`);
      });
      return masked;
    }
    
    if (typeof data === 'object' && data !== null) {
      const masked: any = {};
      Object.entries(data).forEach(([key, value]) => {
        masked[key] = this.maskSensitiveData(value);
      });
      return masked;
    }
    
    return data;
  }

  error(message: string, error?: any, data?: any): void {
    if (import.meta.env.MODE !== 'development') return;
    if (!this.shouldLog('error')) return;
    const combinedData = error ? { error, ...data } : data;
    console.error(`[ERROR] ${message}`, this.maskSensitiveData(combinedData));
  }

  warn(message: string, error?: any, data?: any): void {
    if (import.meta.env.MODE !== 'development') return;
    if (!this.shouldLog('warn')) return;
    const combinedData = error ? { error, ...data } : data;
    console.warn(`[WARN] ${message}`, this.maskSensitiveData(combinedData));
  }

  info(message: string, data?: any): void {
    if (import.meta.env.MODE !== 'development') return;
    if (!this.shouldLog('info')) return;
    console.info(`[INFO] ${message}`, this.maskSensitiveData(data));
  }

  debug(message: string, data?: any): void {
    if (this.isProduction) return;
    if (!this.shouldLog('debug')) return;
    console.debug(`[DEBUG] ${message}`, this.maskSensitiveData(data));
  }
}

export const SecureLogger = new SecureLoggerImpl();