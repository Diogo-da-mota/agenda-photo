/**
 * Módulo de migração de transações
 * 
 * Este módulo contém todas as funções e tipos necessários para
 * migrar transações existentes e manter consistência financeira.
 */

// Exports principais
export { migrarTransacoesExistentes, verificarInconsistenciasEventosFinanceiros } from '../migrateTransactions';

// Exports de tipos
export type { 
  UserId, 
  EventoId, 
  TransacaoId, 
  StatusTransacao, 
  TipoTransacao, 
  TransacaoBase, 
  EventoBase, 
  ResultadoMigracao, 
  ResultadoVerificacao, 
  ValoresFinanceiros, 
  NovaTransacaoParams 
} from './types';

// Exports de constantes
export { 
  TABELAS, 
  STATUS_TRANSACAO, 
  TIPO_TRANSACAO, 
  LOG_PREFIXES, 
  REGEX_PATTERNS, 
  FILTROS_BUSCA, 
  MENSAGENS 
} from './constants';

// Exports de funções auxiliares
export { 
  buscarTransacoesParaMigracao, 
  extrairEventoIdDasObservacoes, 
  atualizarTransacaoComEventoId, 
  corrigirStatusTransacoesRestante 
} from './migrationHelpers';

// Exports de formatadores
export { formatarDataPostgres, formatarDataBrasileira, isValidDate } from '../dateFormatters'; 