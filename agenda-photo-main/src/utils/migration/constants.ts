/**
 * Constantes para migração de transações
 */

// Nomes das tabelas
export const TABELAS = {
  FINANCEIRO_TRANSACOES: 'financeiro_transacoes',
  AGENDA_EVENTOS: 'agenda_eventos'
} as const;

// Status de transações
export const STATUS_TRANSACAO = {
  ENTRADA: 'entrada',
  RESTANTE: 'restante',
  RECEBIDO: 'recebido',
  CANCELADO: 'cancelado'
} as const;

// Tipos de transação
export const TIPO_TRANSACAO = {
  RECEITA: 'receita',
  DESPESA: 'despesa'
} as const;

// Prefixos de log
export const LOG_PREFIXES = {
  MIGRAR_TRANSACOES: '[migrarTransacoesExistentes]',
  VERIFICAR_INCONSISTENCIAS: '[verificarInconsistenciasEventosFinanceiros]'
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
  EVENTO_ID: /ID do evento: ([0-9a-f-]+)/i,
  VALOR_TOTAL: /Valor Total: R\$(\d+(\.\d+)?)/,
  ENTRADA: /Entrada: R\$(\d+(\.\d+)?)/,
  VALOR_RESTANTE: /Valor Restante: R\$(\d+(\.\d+)?)/
} as const;

// Filtros de busca
export const FILTROS_BUSCA = {
  TRANSACOES_EVENTOS: 'descricao.ilike.%Entrada%,descricao.ilike.%Restante%',
  DESCRICAO_RESTANTE: '%Restante%'
} as const;

// Mensagens de resposta
export const MENSAGENS = {
  FUNCAO_DESABILITADA: "FUNÇÃO DESABILITADA: Os valores financeiros são salvos corretamente na tabela agenda_eventos. Não é necessária sincronização automática.",
  NENHUMA_TRANSACAO: 'Não foram encontradas transações que precisem de migração'
} as const; 