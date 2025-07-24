import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const corrigirClienteIds = async (userId: string): Promise<{
  eventosProcessados: number;
  eventosCorrigidos: number;
  erros: string[];
}> => {
  const erros: string[] = [];
  let eventosProcessados = 0;
  let eventosCorrigidos = 0;

  try {
    // 1. Buscar todos os eventos sem cliente_id
    const { data: eventos, error: erroEventos } = await supabase
      .from('agenda_eventos')
      .select('id, titulo, telefone, data_inicio')
      .eq('user_id', userId)
      .is('cliente_id', null);

    if (erroEventos) {
      throw erroEventos;
    }

    logger.info(`[corrigirClienteIds] Encontrados ${eventos?.length || 0} eventos sem cliente_id`);

    for (const evento of eventos || []) {
      eventosProcessados++;
      
      try {
        // 2. Buscar cliente correspondente
        const dataEvento = evento.data_inicio.split('T')[0];
        
        let query = supabase
          .from('clientes')
          .select('id')
          .eq('nome', evento.titulo)
          .eq('user_id', userId)
          .eq('data_evento', dataEvento);
        
        if (evento.telefone) {
          query = query.eq('telefone', evento.telefone);
        } else {
          query = query.is('telefone', null);
        }
        
        const { data: cliente, error: erroCliente } = await query.maybeSingle();
        
        if (erroCliente) {
          erros.push(`Erro ao buscar cliente para evento ${evento.id}: ${erroCliente.message}`);
          continue;
        }
        
        if (cliente) {
          // 3. Atualizar evento com cliente_id
          const { error: erroUpdate } = await supabase
            .from('agenda_eventos')
            .update({ cliente_id: cliente.id })
            .eq('id', evento.id);
          
          if (erroUpdate) {
            erros.push(`Erro ao atualizar evento ${evento.id}: ${erroUpdate.message}`);
          } else {
            eventosCorrigidos++;
            logger.info(`[corrigirClienteIds] Evento ${evento.id} associado ao cliente ${cliente.id}`);
          }
        }
      } catch (error) {
        erros.push(`Erro ao processar evento ${evento.id}: ${error}`);
      }
    }

    return {
      eventosProcessados,
      eventosCorrigidos,
      erros
    };
  } catch (error) {
    logger.error('[corrigirClienteIds] Erro geral:', error);
    throw error;
  }
};