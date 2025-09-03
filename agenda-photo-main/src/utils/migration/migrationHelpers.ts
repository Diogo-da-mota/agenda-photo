import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { TABELAS, STATUS_TRANSACAO, LOG_PREFIXES, REGEX_PATTERNS, FILTROS_BUSCA } from './constants';
import type { UserId, TransacaoBase } from './types';

/**
 * Busca transações relacionadas a eventos que precisam de migração
 * @param userId ID do usuário
 * @returns Promise com array de transações ou null em caso de erro
 */
export async function buscarTransacoesParaMigracao(userId: UserId): Promise<any[] | null> {
  try {
    const { data: transacoes, error } = await supabase
      .from(TABELAS.FINANCEIRO_TRANSACOES)
      .select('*')
      .eq('user_id', userId)
      .or(FILTROS_BUSCA.TRANSACOES_EVENTOS)
      .is('evento_id', null);

    if (error) {
      logger.error(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Erro ao buscar transações:`, error);
      throw error;
    }

    return transacoes || [];
  } catch (error) {
    logger.error(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Erro na busca de transações:`, error);
    return null;
  }
}

/**
 * Extrai o ID do evento das observações de uma transação
 * @param observacoes String com as observações da transação
 * @returns ID do evento extraído ou null se não encontrado
 */
export function extrairEventoIdDasObservacoes(observacoes?: string): string | null {
  if (!observacoes) return null;
  
  const match = observacoes.match(REGEX_PATTERNS.EVENTO_ID);
  return match?.[1] || null;
}

/**
 * Atualiza uma transação com o evento_id extraído
 * @param transacaoId ID da transação a ser atualizada
 * @param eventoId ID do evento a ser vinculado
 * @returns true se sucesso, false se erro
 */
export async function atualizarTransacaoComEventoId(
  transacaoId: string, 
  eventoId: string
): Promise<boolean> {
  try {
    const { error: updateError } = await supabase
      .from(TABELAS.FINANCEIRO_TRANSACOES)
      .update({ evento_id: eventoId } as any)
      .eq('id', transacaoId);

    if (updateError) {
      logger.error(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Erro ao atualizar transação ${transacaoId}:`, updateError);
      return false;
    }

    logger.info(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Transação ${transacaoId} atualizada com evento_id: ${eventoId}`);
    return true;
  } catch (error) {
    logger.error(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Erro na atualização da transação ${transacaoId}:`, error);
    return false;
  }
}

/**
 * Corrige o status de transações de valor restante
 * @param userId ID do usuário
 * @returns número de transações corrigidas
 */
export async function corrigirStatusTransacoesRestante(userId: UserId): Promise<number> {
  try {
    const { data: transacoesRestante, error: errorRestante } = await supabase
      .from(TABELAS.FINANCEIRO_TRANSACOES)
      .select('id')
      .eq('user_id', userId)
      .ilike('descricao', FILTROS_BUSCA.DESCRICAO_RESTANTE)
      .neq('status', STATUS_TRANSACAO.RESTANTE);

    if (errorRestante || !transacoesRestante?.length) {
      return 0;
    }

    const { error: updateError } = await supabase
      .from(TABELAS.FINANCEIRO_TRANSACOES)
      .update({ status: STATUS_TRANSACAO.RESTANTE })
      .eq('user_id', userId)
      .ilike('descricao', FILTROS_BUSCA.DESCRICAO_RESTANTE)
      .neq('status', STATUS_TRANSACAO.RESTANTE);

    if (updateError) {
      logger.error(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Erro ao atualizar status de transações restantes:`, updateError);
      return 0;
    }

    logger.info(`${LOG_PREFIXES.MIGRAR_TRANSACOES} ${transacoesRestante.length} transações com status atualizado para 'restante'`);
    return transacoesRestante.length;
  } catch (error) {
    logger.error(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Erro na correção de status:`, error);
    return 0;
  }
} 