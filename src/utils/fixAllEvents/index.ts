/**
 * Módulo de correção de eventos financeiros
 * 
 * Este módulo foi refatorado para seguir as boas práticas de organização de código,
 * dividindo a responsabilidade em múltiplos arquivos especializados:
 * 
 * - types.ts: Definições de tipos e interfaces
 * - constants.ts: Constantes e configurações
 * - validator.ts: Validação de parâmetros e dados
 * - eventService.ts: Serviços relacionados aos eventos
 * - transactionService.ts: Serviços relacionados às transações
 * - eventProcessor.ts: Processamento principal de eventos
 * - coordinator.ts: Coordenação geral do processo
 * 
 * A refatoração mantém toda a funcionalidade original, mas com melhor:
 * - Separação de responsabilidades
 * - Legibilidade e manutenibilidade
 * - Testabilidade
 * - Reutilização de código
 */

export { corrigirTodosEventosFinanceiros } from './coordinator';

// Exportar tipos para uso externo se necessário
export type { 
  EventoFinanceiro,
  ResultadoCorrecao,
  NovaTransacao,
  TransacaoExistente 
} from './types';

// Exportar constantes para uso externo se necessário
export {
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  TRANSACTION_CATEGORIES
} from './constants';
