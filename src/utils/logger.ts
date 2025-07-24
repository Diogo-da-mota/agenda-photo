/**
 * Serviço de Logging Estruturado para Agenda Pro
 * 
 * Este serviço controla logs baseado no ambiente (desenvolvimento/produção)
 * e filtra informações sensíveis em produção.
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  component?: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
  error: (...args: any[]) => {
    // Em produção, idealmente enviar para um serviço de monitoramento (Sentry, LogRocket, etc.)
    // Por enquanto, vamos garantir que erros detalhados não vazem no console de produção.
    if (isDevelopment) {
      console.error('[ERROR]', ...args);
    } else {
      // Log genérico para produção, para indicar que algo aconteceu sem expor detalhes.
      console.error('An application error occurred.');
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      // Usar um estilo diferente para logs de debug para fácil identificação.
      console.debug('%c[DEBUG]', 'color: #999;', ...args);
    }
  },
  security: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[SECURITY]', ...args);
    }
  },
  audit: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[AUDIT]', ...args);
    }
  },
  emDesenvolvimento: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEV]', ...args);
    }
  },
  emProducao: () => {
    // Função vazia (no-op) para resolver o erro de tipo sem introduzir logs em produção.
  },
}; 