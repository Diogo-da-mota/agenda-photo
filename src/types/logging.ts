export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const LogLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface LoggerConfig {
  level: LogLevel;
  maskData: boolean;
  disableLogs: boolean;
}

export interface EnvironmentConfig {
  production: LoggerConfig;
  development: LoggerConfig;
  staging: LoggerConfig;
  default: LoggerConfig;
}