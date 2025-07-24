import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface ValidacaoTransacao {
  temEntrada: boolean;
  temRestante: boolean;
  transacoesExistentes: Array<{
    id: string;
    tipo: string;
    valor: number;
    criado_em: string;
  }>;
}

/**
 * Verifica transações existentes para um evento
 * Retorna detalhes sobre entrada e valor restante
 */
export const verificarTransacoesExistentes = async (
  eventoId: string, 
  userId: string,
  valorEntrada: number,
  valorRestante: number
): Promise<ValidacaoTransacao> => {
  try {
    logger.info(`[verificarTransacoesExistentes] Verificando transações do evento ${eventoId}`);

    const { data: transacoes, error } = await supabase
      .from('financeiro_transacoes')
      .select('id, tipo, valor, criado_em')
      .eq('evento_id', eventoId)
      .eq('user_id', userId)
      .order('criado_em', { ascending: true });

    if (error) {
      throw new Error(`Erro ao verificar transações: ${error.message}`);
    }

    const resultado: ValidacaoTransacao = {
      temEntrada: false,
      temRestante: false,
      transacoesExistentes: transacoes || []
    };

    if (transacoes) {
      resultado.temEntrada = transacoes.some(t => 
        t.tipo === 'receita' && Math.abs(t.valor - valorEntrada) < 0.01
      );

      resultado.temRestante = transacoes.some(t => 
        t.tipo === 'receita' && Math.abs(t.valor - valorRestante) < 0.01
      );

      logger.info(`[verificarTransacoesExistentes] Evento ${eventoId}: ` +
        `Entrada ${resultado.temEntrada ? 'encontrada' : 'não encontrada'}, ` +
        `Restante ${resultado.temRestante ? 'encontrado' : 'não encontrado'}`);
    }

    return resultado;
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('[verificarTransacoesExistentes] Erro:', mensagem);
    throw error;
  }
};

/**
 * Valida os valores de um evento antes de criar transações
 */
export const validarValoresEvento = (
  valorTotal: number,
  valorEntrada: number,
  valorRestante: number
): void => {
  // Validar valores negativos
  if (valorTotal < 0 || valorEntrada < 0 || valorRestante < 0) {
    throw new Error('Valores negativos não são permitidos');
  }

  // Validar soma dos valores
  const diferenca = Math.abs((valorEntrada + valorRestante) - valorTotal);
  if (diferenca > 0.01) { // Usando 0.01 para evitar problemas de arredondamento
    throw new Error(
      `Valores inconsistentes: Total ${valorTotal} != ` +
      `Entrada ${valorEntrada} + Restante ${valorRestante}`
    );
  }
};

/**
 * Gera um ID único para sincronização
 * Usado para agrupar transações criadas na mesma operação
 */
export const gerarSyncId = (): string => {
  return crypto.randomUUID();
}; 