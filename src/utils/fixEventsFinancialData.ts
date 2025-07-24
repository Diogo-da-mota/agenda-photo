import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { converterDoSupabase } from '@/services/agendaService';

/**
 * Função para corrigir eventos que não possuem transações financeiras associadas
 * ou que possuem dados financeiros inconsistentes
 * 
 * @param userId ID do usuário para filtrar os eventos
 * @returns Número de eventos corrigidos
 */
export const corrigirEventosFinanceiros = async (userId: string): Promise<number> => {
  if (!userId) {
    throw new Error('ID de usuário não fornecido');
  }

  try {
    logger.info('[corrigirEventosFinanceiros] Iniciando correção de dados financeiros dos eventos');
    
    // 1. Buscar todos os eventos do usuário
    const { data: eventos, error: erroEventos } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('user_id', userId);
    
    if (erroEventos) {
      logger.error('[corrigirEventosFinanceiros] Erro ao buscar eventos:', erroEventos);
      throw erroEventos;
    }
    
    if (!eventos || eventos.length === 0) {
      logger.info('[corrigirEventosFinanceiros] Nenhum evento encontrado para o usuário');
      return 0;
    }
    
    logger.info(`[corrigirEventosFinanceiros] ${eventos.length} eventos encontrados para análise`);
    
    let eventosCorridos = 0;
    
    // 2. Para cada evento, verificar se existe transação financeira associada
    for (const eventoDb of eventos) {
      // Converter para o formato do frontend para extrair os valores financeiros
      const evento = converterDoSupabase(eventoDb);
      
      // Verificar se o evento tem valores financeiros
      if (evento.totalValue > 0) {
        // Buscar transação existente relacionada a este evento
        const { data: transacaoExistente, error: erroTransacao } = await supabase
          .from('financeiro_transacoes')
          .select('id, valor')
          .eq('user_id', userId)
          .eq('evento_id', evento.id)
          .eq('tipo', 'receita')
          .eq('status', 'recebido')
          .maybeSingle();
        
        // Se não existir transação ou o valor estiver diferente, criar/atualizar
        if (!transacaoExistente || erroTransacao) {
          // Primeiro, garantir que o formato das observações está correto
          await corrigirFormatoObservacoes(evento.id, userId);
          
          if (evento.downPayment > 0) {
            // Criar nova transação para o valor de entrada
            logger.info(`[corrigirEventosFinanceiros] Criando transação financeira para evento ${evento.id} (${evento.clientName})`);
            
            const novaTransacao = {
              id: uuidv4(),
              descricao: `Entrada - ${evento.eventType} (${evento.clientName})`,
              valor: evento.downPayment,
              tipo: 'receita',
              status: 'recebido',
              data_transacao: new Date().toISOString(),
              categoria: 'Entrada de Evento',
              observacoes: `Valor de entrada para evento do tipo "${evento.eventType}" agendado para ${evento.date.toLocaleDateString()}. ID do evento: ${evento.id}`,
              user_id: userId,
              evento_id: evento.id,
              clienteName: evento.clientName,
              data_evento: evento.date.toISOString(),
              criado_em: new Date().toISOString(),
              atualizado_em: new Date().toISOString()
            };
            
            const { error: erroNovaTransacao } = await supabase
              .from('financeiro_transacoes')
              .insert([novaTransacao]);
            
            if (erroNovaTransacao) {
              logger.error(`[corrigirEventosFinanceiros] Erro ao criar transação para evento ${evento.id}:`, erroNovaTransacao);
            } else {
              logger.info(`[corrigirEventosFinanceiros] Transação criada com sucesso para evento ${evento.id}`);
              eventosCorridos++;
            }
          }
        } else {
          // Se existe transação mas o formato das observações não está correto, corrigir
          await corrigirFormatoObservacoes(evento.id, userId);
          eventosCorridos++;
        }
      }
    }
    
    logger.info(`[corrigirEventosFinanceiros] ${eventosCorridos} eventos corrigidos com sucesso`);
    return eventosCorridos;
  } catch (error) {
    logger.error('[corrigirEventosFinanceiros] Erro ao corrigir eventos:', error);
    throw error;
  }
};

/**
 * Verifica se o evento tem uma entrada no formato correto no campo observacoes
 * @param evento Objeto do evento do banco de dados
 * @returns true se o formato está correto, false caso contrário
 */
export const verificarFormatoObservacoes = (evento: any): boolean => {
  if (!evento.observacoes) return false;
  
  // Verificar se contém os padrões esperados
  const temValorTotal = evento.observacoes.match(/Valor Total: R\$\d+(\.\d+)?/) !== null;
  const temEntrada = evento.observacoes.match(/Entrada: R\$\d+(\.\d+)?/) !== null;
  const temValorRestante = evento.observacoes.match(/Valor Restante: R\$\d+(\.\d+)?/) !== null;
  
  return temValorTotal && temEntrada && temValorRestante;
};

/**
 * Corrige o formato do campo observacoes se necessário
 * @param eventoId ID do evento a corrigir
 * @param userId ID do usuário proprietário do evento
 */
export const corrigirFormatoObservacoes = async (eventoId: string, userId: string): Promise<boolean> => {
  try {
    // Buscar o evento
    const { data: evento, error } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('id', eventoId)
      .eq('user_id', userId)
      .single();
    
    if (error || !evento) {
      logger.error(`[corrigirFormatoObservacoes] Erro ao buscar evento ${eventoId}:`, error);
      return false;
    }
    
    // Se o formato já estiver correto, não fazer nada
    if (verificarFormatoObservacoes(evento)) {
      return true;
    }
    
    // Converter para o formato do frontend para extrair os valores
    const eventoFrontend = converterDoSupabase(evento);
    
    // Reconstruir o campo observacoes
    const observacoesFormatadas = `Valor Total: R$${eventoFrontend.totalValue}
Entrada: R$${eventoFrontend.downPayment}
Valor Restante: R$${eventoFrontend.remainingValue}
${eventoFrontend.notes || ''}`;
    
    // Atualizar o evento
    const { error: erroAtualizacao } = await supabase
      .from('agenda_eventos')
      .update({ observacoes: observacoesFormatadas })
      .eq('id', eventoId)
      .eq('user_id', userId);
    
    if (erroAtualizacao) {
      logger.error(`[corrigirFormatoObservacoes] Erro ao atualizar observações do evento ${eventoId}:`, erroAtualizacao);
      return false;
    }
    
    // Verificar se já existe uma transação financeira para este evento
    const { data: transacaoExistente, error: erroTransacao } = await supabase
      .from('financeiro_transacoes')
      .select('id, valor, descricao')
      .eq('user_id', userId)
      .eq('evento_id', eventoId)
      .eq('tipo', 'receita')
      .eq('status', 'recebido')
      .maybeSingle();
    
    // Se o evento tem entrada > 0 e não existe transação, criar uma
    if (eventoFrontend.downPayment > 0 && (!transacaoExistente || erroTransacao)) {
      // Criar nova transação financeira
      const novaTransacao = {
        id: uuidv4(),
        descricao: `Entrada - ${eventoFrontend.eventType} (${eventoFrontend.clientName})`,
        valor: eventoFrontend.downPayment,
        tipo: 'receita',
        status: 'recebido',
        data_transacao: new Date().toISOString(),
        categoria: 'Entrada de Evento',
        observacoes: `Valor de entrada para evento do tipo "${eventoFrontend.eventType}" agendado para ${eventoFrontend.date.toLocaleDateString()}. ID do evento: ${eventoId}`,
        user_id: userId,
        evento_id: eventoId,
        clienteName: eventoFrontend.clientName,
        data_evento: eventoFrontend.date.toISOString(),
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };
      
      const { error: erroNovaTransacao } = await supabase
        .from('financeiro_transacoes')
        .insert([novaTransacao]);
      
      if (erroNovaTransacao) {
        logger.error(`[corrigirFormatoObservacoes] Erro ao criar transação financeira para evento ${eventoId}:`, erroNovaTransacao);
        // Não falhar completamente, já que o formato das observações foi corrigido
      } else {
        logger.info(`[corrigirFormatoObservacoes] Transação financeira criada para evento ${eventoId}`);
      }
    } 
    // Se já existe transação mas o valor está diferente, atualizar
    else if (eventoFrontend.downPayment > 0 && transacaoExistente && transacaoExistente.valor !== eventoFrontend.downPayment) {
      // Atualizar a transação existente
      const { error: erroAtualizacaoTransacao } = await supabase
        .from('financeiro_transacoes')
        .update({ 
          valor: eventoFrontend.downPayment,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', transacaoExistente.id);
      
      if (erroAtualizacaoTransacao) {
        logger.error(`[corrigirFormatoObservacoes] Erro ao atualizar transação financeira para evento ${eventoId}:`, erroAtualizacaoTransacao);
      } else {
        logger.info(`[corrigirFormatoObservacoes] Transação financeira atualizada para evento ${eventoId}`);
      }
    }
    
    // Sinalizar para o serviço de agenda que houve uma atualização financeira
    try {
      // Não precisamos registrar um novo callback, apenas usar a função de sincronização
      const { sincronizarEventoFinanceiro } = await import('@/services/agendaService');
      
      // Chamar a função de sincronização diretamente
      logger.info(`[corrigirFormatoObservacoes] Sincronizando evento financeiro ${eventoId}`);
      await sincronizarEventoFinanceiro(eventoId, userId);
    } catch (erroCallback) {
      logger.warn(`[corrigirFormatoObservacoes] Erro ao sinalizar atualização financeira:`, erroCallback);
    }
    
    logger.info(`[corrigirFormatoObservacoes] Observações do evento ${eventoId} corrigidas com sucesso`);
    return true;
  } catch (erro) {
    logger.error(`[corrigirFormatoObservacoes] Erro ao corrigir formato das observações do evento ${eventoId}:`, erro);
    return false;
  }
};

/**
 * Corrige especificamente o evento e transações financeiras do cliente "Diogo gonçalves da mota"
 * 
 * @param userId ID do usuário para filtrar os eventos
 * @returns Mensagem indicando se a correção foi bem-sucedida
 */
export const corrigirTransacoesDiogoGoncalves = async (userId: string): Promise<string> => {
  try {
    const { data: eventos, error: erroEventos } = await supabase
      .from('agenda_eventos')
      .select('*')
      .eq('user_id', userId)
      .eq('cliente_id', '45f6b2e8-ef45-41b3-bb82-fb0b33b2e6af');
    
    if (erroEventos) {
      logger.error(`[corrigirTransacoesDiogoGoncalves] Erro ao buscar eventos:`, erroEventos);
      return `Erro ao buscar eventos: ${erroEventos.message}`;
    }
    
    if (!eventos || eventos.length === 0) {
      return 'Nenhum evento encontrado para o cliente especificado';
    }
    
    const eventosProcessados = [];
    
    for (const eventoDb of eventos) {
      try {
        const evento = converterDoSupabase(eventoDb);
        
        // Verificar se há valor de entrada
        if (!evento.downPayment || evento.downPayment <= 0) {
          eventosProcessados.push(`Evento ${evento.id} não tem valor de entrada`);
          continue;
        }
        
        // Buscar transação existente
        const { data: transacaoEntrada, error: erroTransacaoEntrada } = await supabase
          .from('financeiro_transacoes')
          .select('id, valor, status')
          .eq('user_id', userId)
          .eq('evento_id', evento.id)
          .eq('tipo', 'receita')
          .eq('status', 'recebido')
          .maybeSingle();
        
        // Processar a transação
        if (evento.downPayment > 0 && (!transacaoEntrada || erroTransacaoEntrada)) {
          logger.info(`[corrigirTransacoesDiogoGoncalves] Criando transação de entrada para evento ${evento.id}`);
          
          const novaTransacao = {
            id: uuidv4(),
            descricao: `Entrada - ${evento.eventType} (${evento.clientName})`,
            valor: evento.downPayment,
            tipo: 'receita',
            status: 'recebido',
            data_transacao: new Date().toISOString(),
            categoria: 'Entrada de Evento',
            observacoes: `Valor de entrada para evento do tipo "${evento.eventType}" agendado para ${evento.date.toLocaleDateString()}. ID do evento: ${evento.id}`,
            user_id: userId,
            evento_id: evento.id,
            clienteName: evento.clientName,
            data_evento: evento.date.toISOString(),
            criado_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString()
          };
          
          const { error: erroNovaTransacao } = await supabase
            .from('financeiro_transacoes')
            .insert([novaTransacao]);
          
          if (erroNovaTransacao) {
            logger.error(`[corrigirTransacoesDiogoGoncalves] Erro ao criar transação de entrada:`, erroNovaTransacao);
            eventosProcessados.push(`Erro ao criar transação para evento ${evento.id}: ${erroNovaTransacao.message}`);
          } else {
            logger.info(`[corrigirTransacoesDiogoGoncalves] Transação de entrada criada com sucesso`);
            eventosProcessados.push(`Transação criada com sucesso para evento ${evento.id} (${evento.clientName})`);
          }
        } else if (transacaoEntrada) {
          if (transacaoEntrada.valor !== evento.downPayment) {
            // Atualizar o valor se estiver diferente
            const { error: erroAtualizacao } = await supabase
              .from('financeiro_transacoes')
              .update({ 
                valor: evento.downPayment,
                atualizado_em: new Date().toISOString()
              })
              .eq('id', transacaoEntrada.id);
            
            if (erroAtualizacao) {
              eventosProcessados.push(`Erro ao atualizar transação para evento ${evento.id}: ${erroAtualizacao.message}`);
            } else {
              eventosProcessados.push(`Transação atualizada com sucesso para evento ${evento.id}: ${transacaoEntrada.valor} -> ${evento.downPayment}`);
            }
          } else {
            eventosProcessados.push(`Evento ${evento.id} já tem transação com valor correto: ${evento.downPayment}`);
          }
          
          // Verificar se o status está correto
          if (transacaoEntrada.status !== 'recebido') {
            const { error: erroAtualizacaoStatus } = await supabase
              .from('financeiro_transacoes')
              .update({ 
                status: 'recebido',
                atualizado_em: new Date().toISOString()
              })
              .eq('id', transacaoEntrada.id);
            
            if (erroAtualizacaoStatus) {
              eventosProcessados.push(`Erro ao atualizar status da transação para evento ${evento.id}: ${erroAtualizacaoStatus.message}`);
            } else {
              eventosProcessados.push(`Status da transação atualizado com sucesso para evento ${evento.id}: ${transacaoEntrada.status} -> recebido`);
            }
          }
        }
      } catch (erro) {
        logger.error(`[corrigirTransacoesDiogoGoncalves] Erro ao processar evento:`, erro);
        eventosProcessados.push(`Erro ao processar evento ${eventoDb.id}: ${erro.message}`);
      }
    }
    
    return eventosProcessados.join('\n');
  } catch (erro) {
    logger.error(`[corrigirTransacoesDiogoGoncalves] Erro geral:`, erro);
    return `Erro geral: ${erro.message}`;
  }
}; 