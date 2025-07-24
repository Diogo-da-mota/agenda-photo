import { logger } from '@/utils/logger';
import { ParametrosValidacao } from './types';
import { VALIDATION_MESSAGES, LOG_PREFIXES } from './constants';

/**
 * Valida os parâmetros de entrada para a correção de eventos
 * @param params Parâmetros a serem validados
 * @throws Error se os parâmetros forem inválidos
 */
export const validarParametros = (params: ParametrosValidacao): void => {
  logger.info(`${LOG_PREFIXES.VALIDATION} Validando parâmetros de entrada`);
  
  if (!params.userId) {
    logger.error(`${LOG_PREFIXES.VALIDATION} ${VALIDATION_MESSAGES.USER_ID_REQUIRED}`);
    throw new Error(VALIDATION_MESSAGES.USER_ID_REQUIRED);
  }
  
  if (typeof params.userId !== 'string' || params.userId.trim().length === 0) {
    logger.error(`${LOG_PREFIXES.VALIDATION} ${VALIDATION_MESSAGES.INVALID_USER_ID}`);
    throw new Error(VALIDATION_MESSAGES.INVALID_USER_ID);
  }
  
  logger.info(`${LOG_PREFIXES.VALIDATION} Parâmetros validados com sucesso`);
};

/**
 * Valida se um evento possui valores financeiros válidos
 * @param evento Evento a ser validado
 * @returns true se o evento for válido, false caso contrário
 */
export const validarEventoFinanceiro = (evento: any): boolean => {
  if (!evento) {
    logger.warn(`${LOG_PREFIXES.VALIDATION} Evento nulo ou indefinido`);
    return false;
  }
  
  if (evento.totalValue <= 0) {
    logger.info(`${LOG_PREFIXES.VALIDATION} Evento ${evento.id} sem valores financeiros (totalValue: ${evento.totalValue})`);
    return false;
  }
  
  if (evento.downPayment < 0 || evento.remainingValue < 0) {
    logger.warn(`${LOG_PREFIXES.VALIDATION} Evento ${evento.id} com valores negativos (entrada: ${evento.downPayment}, restante: ${evento.remainingValue})`);
    return false;
  }
  
  return true;
};
