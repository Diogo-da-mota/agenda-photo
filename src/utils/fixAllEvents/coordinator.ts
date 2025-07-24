import { logger } from '@/utils/logger';
import { ResultadoCorrecao } from './types';
import { LOG_PREFIXES } from './constants';
import { validarParametros } from './validator';
import { buscarEventos, converterEvento } from './eventService';
import { processarEventoFinanceiro } from './eventProcessor';

/**
 * Corrigir dados financeiros de todos os eventos de um usuário
 * @param userId ID do usuário
 * @returns Número de eventos corrigidos
 */
export const corrigirTodosEventosFinanceiros = async (userId: string): Promise<number> => {
  try {
    logger.info(`${LOG_PREFIXES.MAIN} Iniciando correção de todos os eventos financeiros`);
    
    // 1. Validar parâmetros de entrada
    validarParametros({ userId });
    
    // 2. Buscar todos os eventos do usuário
    const eventosDb = await buscarEventos(userId);
    
    if (eventosDb.length === 0) {
      logger.info(`${LOG_PREFIXES.MAIN} Nenhum evento encontrado para correção`);
      return 0;
    }
    
    logger.info(`${LOG_PREFIXES.MAIN} ${eventosDb.length} eventos encontrados para correção`);
    
    // 3. Processar cada evento
    const resultado = await processarTodosEventos(eventosDb, userId);
    
    // 4. Log do resultado final
    logger.info(`${LOG_PREFIXES.MAIN} Correção finalizada: ${resultado.eventosCorridos} eventos processados`);
    logger.info(`${LOG_PREFIXES.MAIN} Transações criadas: ${resultado.transacoesEntradaCriadas} entradas, ${resultado.transacoesRestanteCriadas} restantes`);
    
    return resultado.eventosCorridos;
    
  } catch (erro) {
    logger.error(`${LOG_PREFIXES.MAIN} Erro geral:`, erro);
    throw erro;
  }
};

/**
 * Processa todos os eventos de um usuário
 * @param eventosDb Lista de eventos do banco de dados
 * @param userId ID do usuário
 * @returns Resultado da correção com contadores
 */
const processarTodosEventos = async (eventosDb: any[], userId: string): Promise<ResultadoCorrecao> => {
  let eventosCorridos = 0;
  let transacoesEntradaCriadas = 0;
  let transacoesRestanteCriadas = 0;
  
  for (const eventoDb of eventosDb) {
    try {
      // Converter evento do formato do banco para o formato do frontend
      const evento = converterEvento(eventoDb);
      
      // Processar as transações financeiras do evento
      const { entradaCriada, restanteCriada } = await processarEventoFinanceiro(evento, userId);
      
      // Atualizar contadores
      if (entradaCriada) transacoesEntradaCriadas++;
      if (restanteCriada) transacoesRestanteCriadas++;
      
      eventosCorridos++;
      
    } catch (erro) {
      logger.error(`${LOG_PREFIXES.MAIN} Erro ao processar evento ${eventoDb.id}:`, erro);
      // Continuar para o próximo evento mesmo com erro
    }
  }
  
  return {
    eventosCorridos,
    transacoesEntradaCriadas,
    transacoesRestanteCriadas
  };
};
