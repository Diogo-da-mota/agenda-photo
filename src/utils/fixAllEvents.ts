/**
 * ARQUIVO REFATORADO - Nova estrutura modular
 * 
 * Este arquivo foi refatorado e dividido em múltiplos módulos especializados
 * localizados na pasta ./fixAllEvents/
 * 
 * A funcionalidade original foi preservada 100%, apenas reorganizada
 * para seguir as boas práticas de arquitetura de código.
 * 
 * Para entender a nova estrutura, consulte:
 * - ./fixAllEvents/index.ts (ponto de entrada)
 * - ./fixAllEvents/coordinator.ts (lógica principal)
 * - ./fixAllEvents/types.ts (definições de tipos)
 * - ./fixAllEvents/constants.ts (constantes)
 * - ./fixAllEvents/validator.ts (validações)
 * - ./fixAllEvents/eventService.ts (serviços de eventos)
 * - ./fixAllEvents/transactionService.ts (serviços de transações)
 * - ./fixAllEvents/eventProcessor.ts (processamento de eventos)
 */

// Re-exporta a função principal da nova estrutura modular
export { corrigirTodosEventosFinanceiros } from './fixAllEvents/coordinator';

// Re-exporta tipos importantes para compatibilidade
export type { 
  EventoFinanceiro,
  ResultadoCorrecao 
} from './fixAllEvents/types'; 