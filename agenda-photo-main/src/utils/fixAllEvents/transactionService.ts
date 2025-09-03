import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { 
  NovaTransacao, 
  TransacaoExistente, 
  EventoFinanceiro, 
  ParametrosTransacao 
} from './types';
import { 
  TRANSACTION_STATUS, 
  TRANSACTION_TYPE, 
  TRANSACTION_CATEGORIES, 
  LOG_PREFIXES 
} from './constants';

/**
 * Busca uma transação existente de entrada para um evento
 * @param userId ID do usuário
 * @param eventoId ID do evento
 * @returns Transação existente ou null
 */
export const buscarTransacaoEntrada = async (userId: string, eventoId: string): Promise<TransacaoExistente | null> => {
  const { data: transacao, error } = await supabase
    .from('financeiro_transacoes')
    .select('id, valor')
    .eq('user_id', userId)
    .eq('evento_id', eventoId)
    .eq('tipo', TRANSACTION_TYPE.RECEITA)
    .eq('status', TRANSACTION_STATUS.RECEBIDO)
    .maybeSingle();
  
  if (error) {
    logger.error(`${LOG_PREFIXES.TRANSACTION_ENTRADA} Erro ao buscar transação de entrada:`, error);
    return null;
  }
  
  return transacao;
};

/**
 * Busca uma transação existente de valor restante para um evento
 * @param userId ID do usuário
 * @param eventoId ID do evento
 * @returns Transação existente ou null
 */
export const buscarTransacaoRestante = async (userId: string, eventoId: string): Promise<TransacaoExistente | null> => {
  const { data: transacao, error } = await supabase
    .from('financeiro_transacoes')
    .select('id, valor')
    .eq('user_id', userId)
    .eq('evento_id', eventoId)
    .eq('status', TRANSACTION_STATUS.RESTANTE)
    .maybeSingle();
  
  if (error) {
    logger.error(`${LOG_PREFIXES.TRANSACTION_RESTANTE} Erro ao buscar transação de valor restante:`, error);
    return null;
  }
  
  return transacao;
};

/**
 * Cria uma nova transação de entrada
 * @param params Parâmetros para criação da transação
 * @returns true se criada com sucesso, false caso contrário
 */
export const criarTransacaoEntrada = async (params: ParametrosTransacao): Promise<boolean> => {
  const { evento, userId } = params;
  
  logger.info(`${LOG_PREFIXES.TRANSACTION_ENTRADA} Criando transação de entrada para evento ${evento.id}`);
  
  const novaTransacao: NovaTransacao = {
    id: uuidv4(),
    descricao: `Entrada - ${evento.eventType} (${evento.clientName})`,
    valor: evento.downPayment,
    tipo: TRANSACTION_TYPE.RECEITA,
    status: TRANSACTION_STATUS.RECEBIDO,
    data_transacao: new Date().toISOString(),
    categoria: TRANSACTION_CATEGORIES.ENTRADA_EVENTO,
    observacoes: `Valor de entrada para evento do tipo "${evento.eventType}" agendado para ${evento.date.toLocaleDateString()}. ID do evento: ${evento.id}`,
    user_id: userId,
    evento_id: evento.id,
    clienteName: evento.clientName,
    data_evento: evento.date.toISOString(),
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('financeiro_transacoes')
    .insert([novaTransacao]);
  
  if (error) {
    logger.error(`${LOG_PREFIXES.TRANSACTION_ENTRADA} Erro ao criar transação de entrada:`, error);
    return false;
  }
  
  logger.info(`${LOG_PREFIXES.TRANSACTION_ENTRADA} Transação de entrada criada com sucesso`);
  return true;
};

/**
 * Cria uma nova transação de valor restante
 * @param params Parâmetros para criação da transação
 * @returns true se criada com sucesso, false caso contrário
 */
export const criarTransacaoRestante = async (params: ParametrosTransacao): Promise<boolean> => {
  const { evento, userId } = params;
  
  logger.info(`${LOG_PREFIXES.TRANSACTION_RESTANTE} Criando transação de valor restante para evento ${evento.id}`);
  
  const novaTransacao: NovaTransacao = {
    id: uuidv4(),
    descricao: `Restante - ${evento.eventType} (${evento.clientName})`,
    valor: evento.remainingValue,
    tipo: TRANSACTION_TYPE.RECEITA,
    status: TRANSACTION_STATUS.RESTANTE,
    data_transacao: evento.date.toISOString(),
    categoria: TRANSACTION_CATEGORIES.VALOR_RESTANTE,
    observacoes: `Valor restante para evento do tipo "${evento.eventType}" agendado para ${evento.date.toLocaleDateString()}. ID do evento: ${evento.id}`,
    user_id: userId,
    evento_id: evento.id,
    clienteName: evento.clientName,
    data_evento: evento.date.toISOString(),
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('financeiro_transacoes')
    .insert([novaTransacao]);
  
  if (error) {
    logger.error(`${LOG_PREFIXES.TRANSACTION_RESTANTE} Erro ao criar transação de valor restante:`, error);
    return false;
  }
  
  logger.info(`${LOG_PREFIXES.TRANSACTION_RESTANTE} Transação de valor restante criada com sucesso`);
  return true;
};

/**
 * Atualiza o valor de uma transação existente
 * @param transacaoId ID da transação a ser atualizada
 * @param novoValor Novo valor da transação
 * @returns true se atualizada com sucesso, false caso contrário
 */
export const atualizarValorTransacao = async (transacaoId: string, novoValor: number): Promise<boolean> => {
  logger.info(`${LOG_PREFIXES.UPDATE} Atualizando transação ${transacaoId} com novo valor ${novoValor}`);
  
  const { error } = await supabase
    .from('financeiro_transacoes')
    .update({ 
      valor: novoValor,
      atualizado_em: new Date().toISOString()
    })
    .eq('id', transacaoId);
  
  if (error) {
    logger.error(`${LOG_PREFIXES.UPDATE} Erro ao atualizar transação ${transacaoId}:`, error);
    return false;
  }
  
  logger.info(`${LOG_PREFIXES.UPDATE} Transação atualizada com sucesso`);
  return true;
};
