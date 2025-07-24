/**
 * Constantes para o módulo financeiro
 */

// Categorias de transações financeiras
export const categorias = {
  receita: ["Sessão Fotográfica", "Ensaio", "Evento", "Venda de Produtos", "Outro"],
  despesa: ["Equipamento", "Software", "Marketing", "Transporte", "Alimentação", "Locação", "Impostos", "Outro"]
} as const;

// Tipos de filtro disponíveis
export const FILTER_TYPES = {
  ALL: 'all',
  INCOME: 'income',
  PENDING: 'pending',
  EXPENSE: 'expense'
} as const;

// Tipos de transação
export const TRANSACTION_TYPES = {
  RECEITA: 'receita',
  DESPESA: 'despesa'
} as const;

// Status de transação
export const TRANSACTION_STATUS = {
  PENDENTE: 'pendente',
  RECEBIDO: 'recebido',
  CONCLUIDO: 'concluido',
  ENTRADA: 'entrada',
  RESTANTE: 'restante'
} as const;

// Configurações de atualização automática
export const AUTO_UPDATE_CONFIG = {
  INTERVAL_MS: 5000, // 5 segundos
  STALE_TIME_MS: 30000 // 30 segundos
} as const;

// Configurações de paginação (para uso futuro)
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
} as const; 