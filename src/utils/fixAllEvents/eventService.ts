import { supabase } from '@/lib/supabase';
import { converterDoSupabase } from '@/services/agendaService';
import { logger } from '@/utils/logger';
import { EventoFinanceiro } from './types';
import { EVENT_STATUS, LOG_PREFIXES } from './constants';

// Tipo para evento do Supabase (baseado no agendaService)
interface EventoSupabase {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  tipo: string | null;
  local: string | null;
  observacoes: string | null;
  status: string | null;
  descricao: string | null;
  cor: string | null;
  cliente_id: string | null;
  notificacao_enviada: boolean | null;
  user_id: string;
  criado_em: string | null;
  atualizado_em: string | null;
  telefone?: string | null;
}

/**
 * Busca todos os eventos de um usuário que não estão cancelados
 * @param userId ID do usuário
 * @returns Lista de eventos do banco de dados
 */
export const buscarEventos = async (userId: string): Promise<EventoSupabase[]> => {
  logger.info(`${LOG_PREFIXES.EVENTS} Buscando eventos para o usuário ${userId}`);
  
  const { data: eventos, error: erroEventos } = await supabase
    .from('agenda_eventos')
    .select('*')
    .eq('user_id', userId)
    .not('status', 'eq', EVENT_STATUS.CANCELADO);
  
  if (erroEventos) {
    logger.error(`${LOG_PREFIXES.EVENTS} Erro ao buscar eventos:`, erroEventos);
    throw erroEventos;
  }
  
  logger.info(`${LOG_PREFIXES.EVENTS} ${eventos?.length || 0} eventos encontrados`);
  
  return eventos || [];
};

/**
 * Converte um evento do formato do Supabase para o formato do frontend
 * @param eventoDb Evento no formato do banco de dados
 * @returns Evento convertido para o formato do frontend
 */
export const converterEvento = (eventoDb: EventoSupabase): EventoFinanceiro => {
  logger.debug(`${LOG_PREFIXES.EVENTS} Convertendo evento ${eventoDb.id}`);
  
  try {
    const evento = converterDoSupabase(eventoDb);
    // Ensure required properties are present for EventoFinanceiro
    return {
      id: evento.id,
      clientName: evento.clientName,
      eventType: evento.eventType,
      date: evento.date,
      totalValue: evento.totalValue || 0,
      downPayment: evento.downPayment || 0,
      remainingValue: evento.remainingValue || 0
    };
  } catch (erro) {
    logger.error(`${LOG_PREFIXES.EVENTS} Erro ao converter evento ${eventoDb.id}:`, erro);
    throw erro;
  }
};
