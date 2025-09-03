import { logger } from '@/utils/logger';
import { formatarDataPostgres, formatarDataBrasileira } from '@/utils/dateFormatters';
import { LOG_PREFIXES, MENSAGENS } from '@/utils/migration/constants';
import type { UserId } from '@/utils/migration/types';
import { 
  buscarTransacoesParaMigracao, 
  extrairEventoIdDasObservacoes, 
  atualizarTransacaoComEventoId,
  corrigirStatusTransacoesRestante 
} from '@/utils/migration/migrationHelpers';

/**
 * Função para migrar transações existentes, preenchendo o campo evento_id
 * a partir do ID extraído do campo observacoes.
 * 
 * @param userId ID do usuário para filtrar as transações
 * @returns Número de transações atualizadas com sucesso
 */
export const migrarTransacoesExistentes = async (userId: UserId): Promise<number> => {
  try {
    logger.info(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Iniciando migração para o usuário ${userId}`);
    
    // 1. Buscar todas as transações relacionadas a eventos (entrada e restante)
    const transacoes = await buscarTransacoesParaMigracao(userId);
    
    if (!transacoes || !transacoes.length) {
      logger.info(`${LOG_PREFIXES.MIGRAR_TRANSACOES} ${MENSAGENS.NENHUMA_TRANSACAO}`);
      return 0;
    }
    
    logger.info(`${LOG_PREFIXES.MIGRAR_TRANSACOES} ${transacoes.length} transações encontradas para migração`);
    
    let transacoesAtualizadas = 0;
    
    for (const transacao of transacoes) {
      // Extrair ID do evento das observações
      const eventoId = extrairEventoIdDasObservacoes(transacao.observacoes);
      
      if (eventoId) {
        // Atualizar a transação com o evento_id extraído
        const sucesso = await atualizarTransacaoComEventoId(transacao.id, eventoId);
        if (sucesso) {
          transacoesAtualizadas++;
        }
      } else {
        logger.warn(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Não foi possível extrair evento_id das observações: ${transacao.observacoes}`);
      }
    }
    
    logger.info(`${LOG_PREFIXES.MIGRAR_TRANSACOES} ${transacoesAtualizadas} transações atualizadas com sucesso`);
    
    // Corrigir status pendente para transações de valor restante
    await corrigirStatusTransacoesRestante(userId);
    
    return transacoesAtualizadas;
  } catch (error) {
    logger.error(`${LOG_PREFIXES.MIGRAR_TRANSACOES} Erro na migração:`, error);
    throw error;
  }
};

/**
 * DESABILITADO: Função para verificar e corrigir inconsistências entre eventos e transações financeiras
 * 
 * MOTIVO: Valores financeiros são salvos corretamente na tabela agenda_eventos.
 * Não deve haver criação automática de transações em financeiro_transacoes.
 * 
 * @param userId ID do usuário para executar a verificação
 * @returns Resumo das correções realizadas
 */
export const verificarInconsistenciasEventosFinanceiros = async (userId: UserId): Promise<string> => {
  logger.info(`${LOG_PREFIXES.VERIFICAR_INCONSISTENCIAS} FUNÇÃO DESABILITADA - Sincronização automática removida para usuário ${userId}`);
  return MENSAGENS.FUNCAO_DESABILITADA;
};

 