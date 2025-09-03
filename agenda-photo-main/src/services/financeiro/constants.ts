/**
 * Constantes para o sistema financeiro
 */

// Status de transações
export const TRANSACTION_STATUS = {
  PENDENTE: 'pendente',
  RECEBIDO: 'recebido',
  CONCLUIDO: 'concluido'
} as const;

// Tipos de transação
export const TRANSACTION_TYPE = {
  RECEITA: 'receita',
  DESPESA: 'despesa'
} as const;

// Valores de validação
export const VALIDATION_LIMITS = {
  MIN_VALUE: 0,
  MAX_VALUE: 999999999,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_CATEGORY_LENGTH: 100,
  DUPLICATE_CHECK_WINDOW_MS: 60000 // 60 segundos
} as const;

// Mensagens de validação
export const VALIDATION_MESSAGES = {
  USER_ID_REQUIRED: 'ID de usuário não fornecido',
  USER_ID_INVALID: 'ID de usuário inválido',
  TRANSACTION_ID_REQUIRED: 'ID de transação não fornecido',
  TRANSACTION_ID_INVALID: 'ID de transação inválido',
  VALUE_INVALID: 'Valor financeiro inválido',
  VALUE_OUT_OF_RANGE: 'Valor financeiro fora do range permitido',
  DUPLICATE_TRANSACTION: 'Transação duplicada detectada. Aguarde alguns segundos antes de tentar novamente.',
  TRANSACTION_NOT_FOUND: 'Transação não encontrada ou acesso negado',
  INVALID_DATA: 'Dados inválidos fornecidos',
  UNAUTHORIZED_ACCESS: 'Acesso negado à transação'
} as const;

// Prefixos de log
export const LOG_PREFIXES = {
  MAIN: '[financeiroService]',
  VALIDATION: '[validacao]',
  CONVERTER: '[converter]',
  SEARCH: '[buscar]',
  CREATE: '[criar]',
  UPDATE: '[atualizar]',
  DELETE: '[excluir]',
  SUMMARY: '[resumo]'
} as const;

// Mapeamento para exibição em português
export const DISPLAY_MAPPINGS = {
  TIPO: {
    receita: 'Receita',
    despesa: 'Despesa'
  },
  STATUS: {
    recebido: 'Recebido',
    pendente: 'Pendente',
    concluido: 'Concluído'
  }
} as const;

// Rate limiting endpoints
export const RATE_LIMIT_ENDPOINTS = {
  CREATE: '/financeiro/transacoes/create',
  UPDATE: '/financeiro/transacoes/update',
  DELETE: '/financeiro/transacoes/delete'
} as const;

// Configurações de consulta
export const QUERY_CONFIG = {
  DEFAULT_ORDER: { column: 'data_transacao', ascending: false },
  DUPLICATE_CHECK_FIELDS: ['user_id', 'descricao', 'valor', 'data_transacao'],
  SELECT_FIELDS: '*'
} as const;
