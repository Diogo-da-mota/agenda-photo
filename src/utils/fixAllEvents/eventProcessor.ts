import { logger } from '@/utils/logger';
import { EventoFinanceiro } from './types';
import { LOG_PREFIXES } from './constants';
import { validarEventoFinanceiro } from './validator';
import { 
  buscarTransacaoEntrada, 
  buscarTransacaoRestante,
  criarTransacaoEntrada,
  criarTransacaoRestante,
  atualizarValorTransacao
} from './transactionService';

/**
 * Processa as transações financeiras de um evento específico
 * @param evento Evento a ser processado
 * @param userId ID do usuário
 * @returns Objeto com contadores de transações criadas
 */
export const processarEventoFinanceiro = async (
  evento: EventoFinanceiro, 
  userId: string
): Promise<{ entradaCriada: boolean; restanteCriada: boolean }> => {
  
  logger.info(`${LOG_PREFIXES.MAIN} Verificando evento ${evento.id} (${evento.clientName})`);
  logger.info(`${LOG_PREFIXES.MAIN} Valores financeiros: Total=${evento.totalValue}, Entrada=${evento.downPayment}, Restante=${evento.remainingValue}`);
  
  // Validar se o evento tem valores financeiros válidos
  if (!validarEventoFinanceiro(evento)) {
    return { entradaCriada: false, restanteCriada: false };
  }
  
  let entradaCriada = false;
  let restanteCriada = false;
  
  // Processar transação de entrada
  if (evento.downPayment > 0) {
    entradaCriada = await processarTransacaoEntrada(evento, userId);
  }
  
  // Processar transação de valor restante  
  if (evento.remainingValue > 0) {
    restanteCriada = await processarTransacaoRestante(evento, userId);
  }
  
  return { entradaCriada, restanteCriada };
};

/**
 * Processa a transação de entrada de um evento
 * @param evento Evento a ser processado
 * @param userId ID do usuário
 * @returns true se uma nova transação foi criada
 */
const processarTransacaoEntrada = async (evento: EventoFinanceiro, userId: string): Promise<boolean> => {
  const transacaoExistente = await buscarTransacaoEntrada(userId, evento.id);
  
  if (!transacaoExistente) {
    // Criar nova transação de entrada
    return await criarTransacaoEntrada({ evento, userId, tipoTransacao: 'entrada' });
  } else {
    logger.info(`${LOG_PREFIXES.TRANSACTION_ENTRADA} Transação de entrada já existe para evento ${evento.id}`);
    
    // Verificar se o valor da transação bate com o valor de entrada no evento
    if (transacaoExistente.valor !== evento.downPayment) {
      logger.warn(`${LOG_PREFIXES.TRANSACTION_ENTRADA} Inconsistência de valor na transação de entrada: transação=${transacaoExistente.valor}, evento=${evento.downPayment}`);
      
      const sucesso = await atualizarValorTransacao(transacaoExistente.id, evento.downPayment);
      if (sucesso) {
        logger.info(`${LOG_PREFIXES.TRANSACTION_ENTRADA} Transação de entrada atualizada: ${transacaoExistente.valor} -> ${evento.downPayment}`);
      }
    }
    
    return false; // Não foi criada uma nova transação
  }
};

/**
 * Processa a transação de valor restante de um evento
 * @param evento Evento a ser processado
 * @param userId ID do usuário
 * @returns true se uma nova transação foi criada
 */
const processarTransacaoRestante = async (evento: EventoFinanceiro, userId: string): Promise<boolean> => {
  const transacaoExistente = await buscarTransacaoRestante(userId, evento.id);
  
  if (!transacaoExistente) {
    // Criar nova transação de valor restante
    return await criarTransacaoRestante({ evento, userId, tipoTransacao: 'restante' });
  } else {
    logger.info(`${LOG_PREFIXES.TRANSACTION_RESTANTE} Transação de valor restante já existe para evento ${evento.id}`);
    
    // Verificar se o valor da transação bate com o valor restante no evento
    if (transacaoExistente.valor !== evento.remainingValue) {
      logger.warn(`${LOG_PREFIXES.TRANSACTION_RESTANTE} Inconsistência de valor na transação restante: transação=${transacaoExistente.valor}, evento=${evento.remainingValue}`);
      
      const sucesso = await atualizarValorTransacao(transacaoExistente.id, evento.remainingValue);
      if (sucesso) {
        logger.info(`${LOG_PREFIXES.TRANSACTION_RESTANTE} Transação restante atualizada: ${transacaoExistente.valor} -> ${evento.remainingValue}`);
      }
    }
    
    return false; // Não foi criada uma nova transação
  }
};
