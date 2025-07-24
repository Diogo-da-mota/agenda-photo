import { EnvironmentConfig } from "@/types/logging";

/**
 * Configuração de logging para cada ambiente.
 * O SecureLogger usará esta configuração para determinar o nível de log
 * e se deve mascarar os dados.
 */
export const loggingConfig: EnvironmentConfig = {
  development: {
    level: 'debug',
    maskData: false,
    disableLogs: false,
  },
  staging: {
    level: 'info',
    maskData: true,
    disableLogs: false,
  },
  production: {
    level: 'warn',
    maskData: true,
    disableLogs: false,
  },
  default: {
    level: 'info',
    maskData: true,
    disableLogs: false,
  },
};