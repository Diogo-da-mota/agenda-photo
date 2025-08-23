/**
 * Configurações e constantes para o sistema de entrega de fotos
 */

export const ENTREGA_FOTOS_CONFIG = {
  // Limites de tempo
  DIAS_PARA_LIMPEZA: 30,
  LIMITE_GALERIAS_EXPIRACAO: 1000,
  LIMITE_GALERIAS_LIMPEZA: 100,
  
  // Buckets do Supabase Storage
  STORAGE_BUCKET: 'entregar-imagens',
  
  // Status das galerias
  STATUS: {
    ATIVA: 'ativa' as const,
    EXPIRADA: 'expirada' as const,
    ARQUIVADA: 'arquivada' as const
  },
  
  // Configurações de backup
  BACKUP: {
    HABILITADO: false, // Temporariamente desabilitado
    PREFIXO_TABELA: 'backup_',
    SUFIXO_DATA: '_backup'
  },
  
  // Configurações de log
  LOG_PREFIX: '[EntregaFotosAutomatic]'
} as const;

export type GaleriaStatus = typeof ENTREGA_FOTOS_CONFIG.STATUS[keyof typeof ENTREGA_FOTOS_CONFIG.STATUS];