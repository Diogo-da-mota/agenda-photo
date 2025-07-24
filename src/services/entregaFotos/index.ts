// Exportações principais do módulo de entrega de fotos
export { entregaFotosAutomaticService, EntregaFotosAutomaticService } from './entregaFotosAutomaticService';

// Exportações dos serviços especializados
export { ExpiracaoService } from './expiracaoService';
export { LimpezaService } from './limpezaService';
export { AcessoService } from './acessoService';
export { RLSService } from './rlsService';
export { BackupService, EstatisticasService } from './backupService';

// Exportações de tipos e configurações
export type { 
  GaleriaStats, 
  ProcessResult, 
  ImagemGaleria, 
  GaleriaExpirada, 
  GaleriaAntiga 
} from './types';

export { ENTREGA_FOTOS_CONFIG } from './config';