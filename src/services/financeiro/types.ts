/**
 * Tipos e interfaces para o sistema financeiro
 */

// Tipos principais para transações financeiras
export interface Transacao {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  valor_entrada?: number;
  valor_restante?: number;
  data_transacao: string;
  categoria: string;  forma_pagamento?: string;
  status: 'pendente' | 'recebido' | 'concluido' | 'entrada' | 'restante';
  observacoes?: string;
  evento_id?: string;
  criado_em: string;
  atualizado_em: string;
  clienteName?: string;
  cliente_id?: string;
  data_evento?: string;
  isDespesaEspecifica?: boolean; // Propriedade para marcar se a transação é originalmente uma despesa
  telefone?: string;
  local?: string;
}

// Interface para filtrar transações
export interface FiltroTransacao {
  dataInicio?: Date;
  dataFim?: Date;
  tipo?: 'receita' | 'despesa' | null;
  status?: 'recebido' | 'pendente' | 'concluido' | 'entrada' | 'restante' | null;
  categoria?: string[];
  busca?: string;
}

// Interface para dados de transação sem campos gerados automaticamente
export type NovaTransacao = Omit<Transacao, 'id' | 'criado_em' | 'atualizado_em'>;

// Interface para atualização parcial de transação
export type AtualizacaoTransacao = Partial<Transacao>;

// Interface para dados de transação do Supabase
export interface TransacaoSupabase {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data_transacao: string;  categoria: string | null;
  forma_pagamento: string | null;
  status: 'pendente' | 'recebido' | 'concluido' | 'entrada' | 'restante';
  observacoes: string | null;
  evento_id: string | null;
  criado_em: string;
  atualizado_em: string;
  clienteName: string | null;
  cliente_id: string | null;
  data_evento: string | null;
}

// Interface para resumo financeiro
export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

// Tipos para validação
export interface ValidacaoResultado<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

// Interface para parâmetros de validação
export interface ParametrosValidacao {
  userId: string;
  transacao?: NovaTransacao;
  id?: string;
}
