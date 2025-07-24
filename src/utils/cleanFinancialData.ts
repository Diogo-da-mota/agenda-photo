import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Limpa transações financeiras duplicadas para um evento específico
 * Mantém apenas a transação mais antiga de cada tipo/valor
 */
export const limparTransacoesDuplicadas = async (eventoId: string, userId: string): Promise<{
  removidas: number;
  erros: string[];
}> => {
  const erros: string[] = [];
  let removidas = 0;

  try {
    logger.info(`[limparTransacoesDuplicadas] Iniciando limpeza para evento ${eventoId}`);

    // 1. Buscar todas as transações do evento
    const { data: transacoes, error: erroSelect } = await supabase
      .from('financeiro_transacoes')
      .select('*')
      .eq('evento_id', eventoId)
      .eq('user_id', userId)
      .order('criado_em', { ascending: true });

    if (erroSelect) {
      throw new Error(`Erro ao buscar transações: ${erroSelect.message}`);
    }

    if (!transacoes?.length) {
      logger.info(`[limparTransacoesDuplicadas] Nenhuma transação encontrada para o evento ${eventoId}`);
      return { removidas: 0, erros };
    }

    // 2. Agrupar por tipo+valor e identificar duplicatas
    const manter = new Map<string, string>();
    const remover: string[] = [];

    transacoes.forEach(t => {
      const chave = `${t.tipo}_${t.valor}`;
      if (!manter.has(chave)) {
        manter.set(chave, t.id);
        logger.info(`[limparTransacoesDuplicadas] Mantendo transação ${t.id} (${t.tipo} - R$${t.valor})`);
      } else {
        remover.push(t.id);
        logger.warn(`[limparTransacoesDuplicadas] Marcando transação duplicada para remoção: ${t.id}`);
      }
    });

    // 3. Remover duplicatas identificadas
    if (remover.length > 0) {
      const { error: erroDelete } = await supabase
        .from('financeiro_transacoes')
        .delete()
        .in('id', remover);

      if (erroDelete) {
        throw new Error(`Erro ao remover transações duplicadas: ${erroDelete.message}`);
      }

      removidas = remover.length;
      logger.info(`[limparTransacoesDuplicadas] ${removidas} transações duplicadas removidas`);
    } else {
      logger.info(`[limparTransacoesDuplicadas] Nenhuma duplicata encontrada para o evento ${eventoId}`);
    }

    return { removidas, erros };
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('[limparTransacoesDuplicadas] Erro:', mensagem);
    erros.push(mensagem);
    return { removidas, erros };
  }
};

/**
 * Limpa transações duplicadas para todos os eventos de um usuário
 */
export const limparTodasTransacoesDuplicadas = async (userId: string): Promise<{
  eventosProcessados: number;
  transacoesRemovidas: number;
  erros: string[];
}> => {
  const erros: string[] = [];
  let eventosProcessados = 0;
  let transacoesRemovidas = 0;

  try {
    // 1. Buscar todos os eventos do usuário
    const { data: eventos, error: erroEventos } = await supabase
      .from('agenda_eventos')
      .select('id')
      .eq('user_id', userId);

    if (erroEventos) {
      throw new Error(`Erro ao buscar eventos: ${erroEventos.message}`);
    }

    if (!eventos?.length) {
      return { eventosProcessados: 0, transacoesRemovidas: 0, erros };
    }

    // 2. Processar cada evento
    for (const evento of eventos) {
      try {
        const { removidas, erros: errosEvento } = await limparTransacoesDuplicadas(evento.id, userId);
        transacoesRemovidas += removidas;
        erros.push(...errosEvento);
        eventosProcessados++;
      } catch (error) {
        const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
        erros.push(`Erro ao processar evento ${evento.id}: ${mensagem}`);
      }
    }

    return { eventosProcessados, transacoesRemovidas, erros };
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    erros.push(mensagem);
    return { eventosProcessados, transacoesRemovidas, erros };
  }
}; 