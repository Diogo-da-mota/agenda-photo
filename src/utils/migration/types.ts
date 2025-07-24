/**
 * Tipos para migração de transações
 */

// Tipos básicos
export type UserId = string;
export type EventoId = string;
export type TransacaoId = string;

// Status permitidos para transações
export type StatusTransacao = 'entrada' | 'restante' | 'recebido' | 'cancelado' | 'pendente';
export type TipoTransacao = 'receita' | 'despesa';

// Interface para transação básica
export interface TransacaoBase {
  id: TransacaoId;
  user_id: UserId;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  status: StatusTransacao;
  data_transacao: string;
  observacoes?: string;
  evento_id?: EventoId;
  created_at: string;
  updated_at: string;
}

// Interface para evento básico
export interface EventoBase {
  id: EventoId;
  user_id: UserId;
  titulo: string;
  tipo?: string;
  data_inicio: string;
  observacoes?: string;
  status: string;
  criado_em?: string;
}

// Resultado de migração
export interface ResultadoMigracao {
  transacoesAtualizadas: number;
  transacoesEncontradas: number;
  erros: string[];
}

// Resultado de verificação de inconsistências
export interface ResultadoVerificacao {
  eventosVerificados: number;
  transacoesCriadas: number;
  transacoesAtualizadas: number;
  inconsistenciasCorrigidas: number;
  resumo: string;
}

// Parâmetros para extração de valores financeiros
export interface ValoresFinanceiros {
  valorTotal: number;
  valorEntrada: number;
  valorRestante: number;
}

// Parâmetros para criação de nova transação
export interface NovaTransacaoParams {
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  status: StatusTransacao;
  data_transacao: string;
  observacoes: string;
  user_id: UserId;
  evento_id: EventoId;
} 