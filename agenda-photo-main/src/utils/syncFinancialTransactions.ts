import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { verificarTransacoesExistentes, validarValoresEvento, gerarSyncId } from './validateFinancialTransactions';
import { v4 as uuidv4 } from 'uuid';

interface SyncResult {
  success: boolean;
  transacoesCriadas: number;
  erros: string[];
}

/**
 * Sincroniza um evento com o módulo financeiro de forma atômica
 * Cria transações de entrada e valor restante se necessário
 */
export const sincronizarEventoFinanceiro = async (
  eventoId: string,
  userId: string,
  valorTotal: number,
  valorEntrada: number,
  valorRestante: number,
  descricaoEvento: string,
  dataEvento: string
): Promise<SyncResult> => {
  const result: SyncResult = {
    success: false,
    transacoesCriadas: 0,
    erros: []
  };

  try {
    // 1. Validar valores
    validarValoresEvento(valorTotal, valorEntrada, valorRestante);

    // 2. Verificar transações existentes
    const { temEntrada, temRestante } = await verificarTransacoesExistentes(
      eventoId,
      userId,
      valorEntrada,
      valorRestante
    );

    // 3. Gerar ID único para este grupo de transações
    const syncId = gerarSyncId();

    // 4. Iniciar transação no banco
    const { error: errorTransaction } = await supabase.rpc('iniciar_transacao');
    if (errorTransaction) throw new Error(`Erro ao iniciar transação: ${errorTransaction.message}`);

    try {
      // 5. Criar transações necessárias
      if (valorEntrada > 0 && !temEntrada) {
        const transacaoEntrada = {
          id: uuidv4(),
          descricao: `Entrada - ${descricaoEvento}`,
          valor: valorEntrada,
          tipo: 'receita',
          status: 'recebido',
          data_transacao: new Date().toISOString(),
          categoria: 'Entrada de Evento',
          observacoes: `Valor de entrada para evento agendado para ${dataEvento}`,
          user_id: userId,
          evento_id: eventoId,
          sync_id: syncId,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        };

        const { error: errorEntrada } = await supabase
          .from('financeiro_transacoes')
          .insert([transacaoEntrada]);

        if (errorEntrada) throw new Error(`Erro ao criar transação de entrada: ${errorEntrada.message}`);
        result.transacoesCriadas++;
      }

      if (valorRestante > 0 && !temRestante) {
        const transacaoRestante = {
          id: uuidv4(),
          descricao: `Restante - ${descricaoEvento}`,
          valor: valorRestante,
          tipo: 'receita',
          status: 'pendente',
          data_transacao: new Date().toISOString(),
          categoria: 'Valor Restante',
          observacoes: `Valor restante para evento agendado para ${dataEvento}`,
          user_id: userId,
          evento_id: eventoId,
          sync_id: syncId,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        };

        const { error: errorRestante } = await supabase
          .from('financeiro_transacoes')
          .insert([transacaoRestante]);

        if (errorRestante) throw new Error(`Erro ao criar transação restante: ${errorRestante.message}`);
        result.transacoesCriadas++;
      }

      // 6. Commit da transação
      const { error: errorCommit } = await supabase.rpc('commit_transacao');
      if (errorCommit) throw new Error(`Erro ao commit transação: ${errorCommit.message}`);

      result.success = true;
      logger.info(`[sincronizarEventoFinanceiro] Evento ${eventoId} sincronizado com sucesso. Transações criadas: ${result.transacoesCriadas}`);
    } catch (error) {
      // Rollback em caso de erro
      const { error: errorRollback } = await supabase.rpc('rollback_transacao');
      if (errorRollback) {
        logger.error('[sincronizarEventoFinanceiro] Erro ao fazer rollback:', errorRollback);
      }
      throw error;
    }
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('[sincronizarEventoFinanceiro] Erro:', mensagem);
    result.erros.push(mensagem);
  }

  return result;
}; 