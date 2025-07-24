import { simpleLogger as logger } from '@/utils/simpleLogger';
import { 
  validarTransacao, 
  validarAtualizacaoTransacao,
  filtroTransacaoSchema
} from '@/schemas/financeiro';
import { 
  ParametrosValidacao, 
  ValidacaoResultado, 
  FiltroTransacao,
  AtualizacaoTransacao,
  NovaTransacao
} from './types';
import { 
  VALIDATION_MESSAGES, 
  VALIDATION_LIMITS,
  LOG_PREFIXES 
} from './constants';

/**
 * Valida os parâmetros básicos de entrada
 */
export const validarParametrosBasicos = (params: ParametrosValidacao): void => {
  logger.debug(`${LOG_PREFIXES.VALIDATION} Validando parâmetros básicos`);
  
  if (!params.userId || typeof params.userId !== 'string' || params.userId.trim().length === 0) {
    logger.security(`${LOG_PREFIXES.VALIDATION} ${VALIDATION_MESSAGES.USER_ID_INVALID}`, { userId: params.userId }, 'financeiroService');
    throw new Error(VALIDATION_MESSAGES.USER_ID_INVALID);
  }
  
  if (params.id && (typeof params.id !== 'string' || params.id.trim().length === 0)) {
    logger.error(`${LOG_PREFIXES.VALIDATION} ${VALIDATION_MESSAGES.TRANSACTION_ID_INVALID}`, { id: params.id }, 'financeiroService');
    throw new Error(VALIDATION_MESSAGES.TRANSACTION_ID_INVALID);
  }
  
  logger.debug(`${LOG_PREFIXES.VALIDATION} Parâmetros básicos validados com sucesso`);
};

/**
 * Valida dados de uma nova transação
 */
export const validarDadosTransacao = (transacao: NovaTransacao): ValidacaoResultado<NovaTransacao> => {
  logger.debug(`${LOG_PREFIXES.VALIDATION} Validando dados da transação`);
  
  try {
    const validacao = validarTransacao(transacao);
    
    if (!validacao.success) {
      logger.error(`${LOG_PREFIXES.VALIDATION} Dados de transação inválidos`, validacao.error, 'financeiroService');
      return {
        success: false,
        error: {
          message: `${VALIDATION_MESSAGES.INVALID_DATA}: ${validacao.error?.message}`,
          details: validacao.error?.details
        }
      };
    }
    
    const dadosValidados = validacao.data!;
    
    // Validação adicional de valores financeiros
    if (dadosValidados.valor <= VALIDATION_LIMITS.MIN_VALUE || dadosValidados.valor > VALIDATION_LIMITS.MAX_VALUE) {
      logger.error(`${LOG_PREFIXES.VALIDATION} ${VALIDATION_MESSAGES.VALUE_OUT_OF_RANGE}`, { valor: dadosValidados.valor }, 'financeiroService');
      return {
        success: false,
        error: {
          message: VALIDATION_MESSAGES.VALUE_OUT_OF_RANGE,
          details: { valor: dadosValidados.valor, min: VALIDATION_LIMITS.MIN_VALUE, max: VALIDATION_LIMITS.MAX_VALUE }
        }
      };
    }
    
    logger.debug(`${LOG_PREFIXES.VALIDATION} Dados da transação validados com sucesso`);
    return {
      success: true,
      data: dadosValidados
    };
    
  } catch (error) {
    logger.error(`${LOG_PREFIXES.VALIDATION} Erro na validação dos dados`, error, 'financeiroService');
    return {
      success: false,
      error: {
        message: `${VALIDATION_MESSAGES.INVALID_DATA}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: error
      }
    };
  }
};

/**
 * Valida dados para atualização de transação
 */
export const validarDadosAtualizacao = (transacao: AtualizacaoTransacao): ValidacaoResultado<AtualizacaoTransacao> => {
  logger.debug(`${LOG_PREFIXES.VALIDATION} Validando dados de atualização`);
  
  try {
    const validacao = validarAtualizacaoTransacao(transacao);
    
    if (!validacao.success) {
      logger.error(`${LOG_PREFIXES.VALIDATION} Dados de atualização inválidos`, validacao.error, 'financeiroService');
      return {
        success: false,
        error: {
          message: `Dados de atualização inválidos: ${validacao.error?.message}`,
          details: validacao.error?.details
        }
      };
    }
    
    logger.debug(`${LOG_PREFIXES.VALIDATION} Dados de atualização validados com sucesso`);
    return {
      success: true,
      data: validacao.data
    };
    
  } catch (error) {
    logger.error(`${LOG_PREFIXES.VALIDATION} Erro na validação de atualização`, error, 'financeiroService');
    return {
      success: false,
      error: {
        message: `Dados de atualização inválidos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: error
      }
    };
  }
};

/**
 * Valida filtros de busca
 */
export const validarFiltros = (filtros: FiltroTransacao): FiltroTransacao | undefined => {
  logger.debug(`${LOG_PREFIXES.VALIDATION} Validando filtros de busca`);
  
  try {
    const filtrosValidados = filtroTransacaoSchema.parse(filtros);
    logger.debug(`${LOG_PREFIXES.VALIDATION} Filtros validados com sucesso`);
    return filtrosValidados;
  } catch (error) {
    logger.security(`${LOG_PREFIXES.VALIDATION} Filtros inválidos fornecidos, usando busca sem filtros`, error, 'financeiroService');
    return undefined;
  }
};

/**
 * Valida se o status é aceito pelo banco de dados
 */
export const validarStatus = (status: string): string => {
  const statusValidos = ['recebido', 'pendente', 'concluido'];
  
  if (!statusValidos.includes(status)) {
    logger.security(`${LOG_PREFIXES.VALIDATION} Status inválido: ${status}. Será convertido para 'recebido'`, null, 'financeiroService');
    return 'recebido';
  }
  
  return status;
};
