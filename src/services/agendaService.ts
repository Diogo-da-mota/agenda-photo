import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Event } from '@/components/agenda/types';

type EventRow = Database['public']['Tables']['eventos']['Row'];
type EventInsert = Database['public']['Tables']['eventos']['Insert'];
type EventUpdate = Database['public']['Tables']['eventos']['Update'];

export const buscarEventos = async (userId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('user_id', userId)
    .order('data_inicio', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(mapEventRowToEvent);
};

export const criarEvento = async (evento: Omit<Event, 'id'>, userId: string): Promise<Event> => {
  const eventData: EventInsert = {
    user_id: userId,
    nome_cliente: evento.clientName,
    tipo_evento: evento.eventType,
    data_inicio: evento.date.toISOString(),
    hora_inicio: evento.startTime,
    hora_fim: evento.endTime,
    local: evento.location,
    observacoes: evento.notes || '',
    status: evento.status,
    telefone_cliente: evento.clientPhone || '',
    email_cliente: evento.clientEmail || '',
    valor_total: evento.totalValue || 0,
    valor_entrada: evento.downPayment || 0,
    lembrete_enviado: evento.reminderSent || false
  };

  const { data, error } = await supabase
    .from('eventos')
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
  
  if (updates.clientName) updateData.nome_cliente = updates.clientName;
  if (updates.eventType) updateData.tipo_evento = updates.eventType;
  if (updates.date) updateData.data_inicio = updates.date.toISOString();
  if (updates.startTime) updateData.hora_inicio = updates.startTime;
  if (updates.endTime) updateData.hora_fim = updates.endTime;
  if (updates.location) updateData.local = updates.location;
  if (updates.notes !== undefined) updateData.observacoes = updates.notes;
  if (updates.status) updateData.status = updates.status;
  if (updates.clientPhone !== undefined) updateData.telefone_cliente = updates.clientPhone;
  if (updates.clientEmail !== undefined) updateData.email_cliente = updates.clientEmail;
  if (updates.totalValue !== undefined) updateData.valor_total = updates.totalValue;
  if (updates.downPayment !== undefined) updateData.valor_entrada = updates.downPayment;
  if (updates.reminderSent !== undefined) updateData.lembrete_enviado = updates.reminderSent;

  const { data, error } = await supabase
    .from('eventos')
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
    .from('eventos')
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
    .from('eventos')
    .select('data_inicio, status')
    .eq('user_id', userId)
    .gte('data_inicio', inicioMes.toISOString())
    .lte('data_inicio', fimMes.toISOString());

  if (error) {
    throw error;
  }

  return (data || []).map(evento => ({
    data_inicio: new Date(evento.data_inicio),
    cor: getStatusColor(evento.status)
  }));
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
    clientName: row.nome_cliente,
    eventType: row.tipo_evento,
    date: new Date(row.data_inicio),
    startTime: row.hora_inicio,
    endTime: row.hora_fim || '',
    location: row.local,
    notes: row.observacoes || '',
    status: row.status as Event['status'],
    clientPhone: row.telefone_cliente || '',
    clientEmail: row.email_cliente || '',
    totalValue: row.valor_total || 0,
    downPayment: row.valor_entrada || 0,
    remainingValue: (row.valor_total || 0) - (row.valor_entrada || 0),
    reminderSent: row.lembrete_enviado || false
  };
};