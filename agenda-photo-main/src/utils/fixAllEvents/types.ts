/**
 * Tipos e interfaces para o sistema de correção de eventos financeiros
 */

export interface NovaTransacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita';
  status: 'recebido' | 'restante';
  data_transacao: string;
  categoria: string;
  observacoes: string;
  user_id: string;
  evento_id: string;
  clienteName: string;
  data_evento: string;
  criado_em: string;
  atualizado_em: string;
}

export interface TransacaoExistente {
  id: string;
  valor: number;
}

export interface EventoFinanceiro {
  id: string;
  clientName: string;
  eventType: string;
  date: Date;
  totalValue: number;
  downPayment: number;
  remainingValue: number;
}

export interface EventoSupabase {
  id: string;
  user_id: string;
  status: string;
  [key: string]: any;
}

export interface ResultadoCorrecao {
  eventosCorridos: number;
  transacoesEntradaCriadas: number;
  transacoesRestanteCriadas: number;
}

export interface ParametrosValidacao {
  userId: string;
}

export interface ParametrosTransacao {
  evento: EventoFinanceiro;
  userId: string;
  tipoTransacao: 'entrada' | 'restante';
}
