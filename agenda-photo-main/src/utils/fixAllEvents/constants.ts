/**
 * Constantes para o sistema de correção de eventos financeiros
 */

export const TRANSACTION_STATUS = {
  RECEBIDO: 'recebido',
  RESTANTE: 'restante',
  CANCELADO: 'cancelado'
} as const;

export const TRANSACTION_TYPE = {
  RECEITA: 'receita',
  DESPESA: 'despesa'
} as const;

export const EVENT_STATUS = {
  AGENDADO: 'agendado',
  CONFIRMADO: 'confirmado',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado'
} as const;

export const TRANSACTION_CATEGORIES = {
  ENTRADA_EVENTO: 'Entrada de Evento',
  VALOR_RESTANTE: 'Valor Restante'
} as const;

export const VALIDATION_MESSAGES = {
  USER_ID_REQUIRED: 'ID de usuário não fornecido',
  INVALID_USER_ID: 'ID de usuário inválido',
  NO_EVENTS_FOUND: 'Nenhum evento encontrado para correção',
  INVALID_EVENT_VALUES: 'Valores financeiros do evento são inválidos'
} as const;

export const LOG_PREFIXES = {
  MAIN: '[corrigirTodosEventosFinanceiros]',
  VALIDATION: '[validarParametros]',
  EVENTS: '[buscarEventos]',
  TRANSACTION_ENTRADA: '[processarTransacaoEntrada]',
  TRANSACTION_RESTANTE: '[processarTransacaoRestante]',
  UPDATE: '[atualizarTransacao]'
} as const;
