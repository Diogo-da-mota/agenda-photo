import { EnvironmentConfig } from "@/types/logging";

/**
 * Configuração de logging para cada ambiente.
 * O SecureLogger usará esta configuração para determinar o nível de log
 * e se deve mascarar os dados.
 */
export const loggingConfig: EnvironmentConfig = {
  development: {
    level: 'warn', // Reduzido de 'debug' para 'warn' para menos logs
    maskData: true, // Ativado mascaramento mesmo em desenvolvimento
    disableLogs: false,
  },
  staging: {
    level: 'warn', // Reduzido de 'info' para 'warn'
    maskData: true,
    disableLogs: false,
  },
  production: {
    level: 'error', // Reduzido de 'warn' para 'error'
    maskData: true,
    disableLogs: false,
  },
  default: {
    level: 'warn', // Reduzido de 'info' para 'warn'
    maskData: true,
    disableLogs: false,
  },
};