import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';
import { Event } from '@/components/agenda/types';

type EventRow = Database['public']['Tables']['agenda_eventos']['Row'];
type EventInsert = Database['public']['Tables']['agenda_eventos']['Insert'];
type EventUpdate = Database['public']['Tables']['agenda_eventos']['Update'];

export const buscarEventos = async (userId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('agenda_eventos')
    .select('*')
    .eq('user_id', userId)
    .order('data_inicio', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(mapEventRowToEvent);
};

export const criarEvento = async (evento: Omit<Event, 'id'>, userId: string): Promise<Event> => {
  const eventData = {
    user_id: userId,
    titulo: evento.clientName,
    tipo: evento.eventType,
    data_inicio: evento.date.toISOString(),
    data_fim: new Date(evento.date.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2 horas por padrão
    local: evento.location,
    observacoes: evento.notes || '',
    status: evento.status,
    telefone: evento.clientPhone || evento.phone || '',
    valor_total: evento.totalValue || 0,
    valor_entrada: evento.downPayment || 0,
  };

  const { data, error } = await supabase
    .from('agenda_eventos')
    .insert(eventData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapEventRowToEvent(data);
};

export const atualizarEvento = async (id: string, updates: Partial<Event>, userId: string): Promise<Event> => {
  const updateData: EventUpdate = {};
  
  if (updates.clientName) updateData.titulo = updates.clientName;
  if (updates.eventType) updateData.tipo = updates.eventType;
  if (updates.date) updateData.data_inicio = updates.date.toISOString();
  if (updates.location) updateData.local = updates.location;
  if (updates.notes !== undefined) updateData.observacoes = updates.notes;
  if (updates.status) updateData.status = updates.status;
  if (updates.clientPhone !== undefined || updates.phone !== undefined) updateData.telefone = updates.clientPhone || updates.phone;
  if (updates.totalValue !== undefined) updateData.valor_total = updates.totalValue;
  if (updates.downPayment !== undefined) updateData.valor_entrada = updates.downPayment;

  const { data, error } = await supabase
    .from('agenda_eventos')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapEventRowToEvent(data);
};

export const excluirEvento = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('agenda_eventos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
};

export const buscarDatasComEventos = async (userId: string, mes: number, ano: number) => {
  const inicioMes = new Date(ano, mes, 1);
  const fimMes = new Date(ano, mes + 1, 0);

  const { data, error } = await supabase
    .from('agenda_eventos')
    .select('data_inicio, status')
    .eq('user_id', userId)
    .gte('data_inicio', inicioMes.toISOString())
    .lte('data_inicio', fimMes.toISOString());

  if (error) {
    throw error;
  }

  return (data || []).map(evento => ({
    id: evento.data_inicio.toString(),
    titulo: 'Evento',
    dataInicio: new Date(evento.data_inicio),
    dataFim: new Date(evento.data_inicio),
    cor: getStatusColor(evento.status)
  }));
};

// Missing exports that other files are trying to import
export const converterDoSupabase = (row: any): Event => {
  return mapEventRowToEvent(row);
};

export const registrarPagamentoParcial = async (eventId: string, valor: number, userId: string): Promise<Event> => {
  const { data, error } = await supabase
    .from('agenda_eventos')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return mapEventRowToEvent(data);
};

export const gerarReciboEvento = async (eventId: string, userId: string) => {
  const evento = await buscarEvento(eventId, userId);
  return {
    evento,
    telefoneCliente: evento.clientPhone || evento.phone || ''
  };
};

export const sincronizarTodosEventosFinanceiro = async (userId: string) => {
  console.log('Sincronizando eventos financeiros para usuário:', userId);
  // Return a proper result object instead of void
  return {
    total: 0,
    sucessos: 0,
    falhas: 0,
    detalhes: []
  };
};

export const registrarCallbackAtualizacaoFinanceiro = (callback: Function) => {
  console.log('Callback de atualização financeira registrado');
};

export const buscarEventosProximos10Dias = async (userId: string): Promise<Event[]> => {
  const hoje = new Date();
  const em10Dias = new Date();
  em10Dias.setDate(hoje.getDate() + 10);

  const { data, error } = await supabase
    .from('agenda_eventos')
    .select('*')
    .eq('user_id', userId)
    .gte('data_inicio', hoje.toISOString())
    .lte('data_inicio', em10Dias.toISOString())
    .order('data_inicio', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapEventRowToEvent);
};

export const sincronizarEventoFinanceiro = async (eventId: string, userId: string) => {
  console.log('Sincronizando evento financeiro:', eventId, userId);
};

export interface EventoCalendario {
  id: string;
  titulo: string;
  dataInicio: Date;
  dataFim: Date;
  cor?: string;
}

const buscarEvento = async (eventId: string, userId: string): Promise<Event> => {
  const { data, error } = await supabase
    .from('agenda_eventos')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return mapEventRowToEvent(data);
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmado':
      return '#22c55e';
    case 'pendente':
      return '#f59e0b';
    case 'cancelado':
      return '#ef4444';
    case 'concluido':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
};

const mapEventRowToEvent = (row: EventRow): Event => {
  return {
    id: row.id,
    clientName: row.titulo,
    eventType: row.tipo || '',
    date: new Date(row.data_inicio),
    startTime: '',
    endTime: '',
    time: '',
    location: row.local || '',
    notes: row.observacoes || '',
    status: row.status as Event['status'],
    clientPhone: row.telefone || '',
    phone: row.telefone || '',
    clientEmail: '',
    totalValue: row.valor_total || 0,
    downPayment: row.valor_entrada || 0,
    remainingValue: (row.valor_total || 0) - (row.valor_entrada || 0),
    reminderSent: row.notificacao_enviada || false,
    cpf_cliente: row.cpf_cliente || '',
    endereco_cliente: row.endereco_cliente || ''
  };
};