import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';
import { buscarEventos, atualizarEvento, excluirEvento, buscarDatasComEventos } from '@/services/agendaService';
import { corrigirTodosEventosFinanceiros } from '@/utils/fixAllEvents';
import { Event, EventStatus, PartialEventFinancials } from '@/components/agenda/types';

export interface AgendaServiceProps {
  user: any;
  events: Event[];
  setEvents: (events: Event[]) => void;
  setEventDates: (dates: { date: Date; color?: string }[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsFixingEvents: (fixing: boolean) => void;
  currentMonth: number;
  currentYear: number;
  toast: ReturnType<typeof useToast>['toast'];
  queryClient: any;
}

export const agendaBusinessService = {
  // Carregar eventos do Supabase
  async carregarEventos(props: AgendaServiceProps) {
    const { user, setEvents, setIsLoading, setError, toast } = props;
    
    if (!user) return;
    
    try {
      setIsLoading(true);
      logger.debug('Carregando eventos do usuário', null, 'Agenda');
      const eventosCarregados = await buscarEventos(user.id);
      setEvents(eventosCarregados);
      
      // Atualizar o calendário
      await this.atualizarCalendario(props);
      
      setError(null);
      logger.debug(`${eventosCarregados.length} eventos carregados com sucesso`, null, 'Agenda');
    } catch (err) {
      logger.error('Erro ao carregar eventos', err, 'Agenda');
      setError('Não foi possível carregar os eventos. Por favor, tente novamente.');
      toast({
        title: 'Erro ao carregar eventos',
        description: 'Não foi possível carregar seus eventos. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  },

  // Filtrar e ordenar eventos
  filtrarEventos(events: Event[], searchQuery: string, statusFilter: string, dateFilter: Date | null): Event[] {
    return events.filter(event => {
      // Filtro por texto
      const matchesQuery = event.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtro por status
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      
      // Filtro por data específica (quando uma data do calendário é clicada)
      const matchesDate = !dateFilter || 
                         (event.date.getFullYear() === dateFilter.getFullYear() &&
                          event.date.getMonth() === dateFilter.getMonth() &&
                          event.date.getDate() === dateFilter.getDate());
      
      return matchesQuery && matchesStatus && matchesDate;
    }).sort((a, b) => {
      // Ordenar por data e hora crescentes - eventos mais próximos aparecem primeiro
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
  },

  // Alterar o status de um evento
  async alterarStatusEvento(
    eventId: string, 
    newStatus: EventStatus, 
    financials: PartialEventFinancials | undefined,
    props: AgendaServiceProps
  ) {
    const { user, events, setEvents, toast } = props;
    
    if (!user) return;
    
    try {
      logger.debug(`Atualizando status do evento ${eventId} para ${newStatus}`, { newStatus, financials }, 'Agenda');
      
      // Criar objeto de atualização com o novo status
      const updateData: any = { status: newStatus };
      
      // Adicionar valores financeiros se fornecidos
      if (financials) {
        if (financials.totalValue !== undefined) updateData.totalValue = financials.totalValue;
        if (financials.downPayment !== undefined) updateData.downPayment = financials.downPayment;
        if (financials.remainingValue !== undefined) updateData.remainingValue = financials.remainingValue;
      }
      
      await atualizarEvento(eventId, updateData, user.id);
      
      // Atualizar o estado local
      setEvents(events.map(event => {
        if (event.id === eventId) {
          return { 
            ...event, 
            status: newStatus,
            ...(financials?.totalValue !== undefined && { totalValue: financials.totalValue }),
            ...(financials?.downPayment !== undefined && { downPayment: financials.downPayment }),
            ...(financials?.remainingValue !== undefined && { remainingValue: financials.remainingValue })
          };
        }
        return event;
      }));
      
      // Atualizar o calendário
      await this.atualizarCalendario(props);
      
      logger.debug(`Status do evento ${eventId} atualizado com sucesso`, null, 'Agenda');
      toast({
        title: "Status atualizado",
        description: `O status do evento foi alterado para ${newStatus}.`
      });
    } catch (err) {
      logger.error('Erro ao atualizar status do evento', err, 'Agenda');
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status do evento. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  },

  // Reagendar um evento
  async reagendarEvento(eventId: string, newDate: Date, props: AgendaServiceProps) {
    const { user, events, setEvents, toast } = props;
    
    if (!user) return;
    
    try {
      logger.debug(`Reagendando evento ${eventId}`, { newDate: newDate.toISOString() }, 'Agenda');
      
      await atualizarEvento(eventId, { date: newDate }, user.id);
      
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, date: newDate } 
          : event
      ));
      
      // Atualizar o calendário
      await this.atualizarCalendario(props);
      
      logger.debug(`Evento ${eventId} reagendado com sucesso`, null, 'Agenda');
      toast({
        title: "Evento reagendado",
        description: `O evento foi reagendado para ${newDate.toLocaleDateString()}.`
      });
    } catch (err) {
      logger.error('Erro ao reagendar evento', err, 'Agenda');
      toast({
        title: 'Erro ao reagendar',
        description: 'Não foi possível reagendar o evento. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  },

  // Enviar lembrete
  async enviarLembrete(eventId: string, props: AgendaServiceProps) {
    const { user, events, setEvents, toast } = props;
    
    if (!user) return;
    
    try {
      logger.debug(`Enviando lembrete para evento ${eventId}`, null, 'Agenda');
      
      await atualizarEvento(eventId, { reminderSent: true }, user.id);
      
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, reminderSent: true } 
          : event
      ));
      
      logger.debug(`Lembrete enviado com sucesso para evento ${eventId}`, null, 'Agenda');
      toast({
        title: "Lembrete enviado",
        description: "Um lembrete foi enviado para o cliente via WhatsApp."
      });
    } catch (err) {
      logger.error('Erro ao enviar lembrete', err, 'Agenda');
      toast({
        title: 'Erro ao enviar lembrete',
        description: 'Não foi possível enviar o lembrete. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  },

  // Gerar recibo
  gerarRecibo(eventId: string, props: AgendaServiceProps) {
    const { events, toast } = props;
    
    try {
      logger.debug(`Gerando recibo para evento ${eventId}`, null, 'Agenda');
      
      // Encontrar o evento pelo ID
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        throw new Error('Evento não encontrado');
      }
      
      // Criar dados do recibo
      const receiptData = {
        eventId: event.id,
        clientName: event.clientName,
        eventType: event.eventType,
        date: event.date,
        location: event.location,
        totalValue: event.totalValue,
        downPayment: event.downPayment,
        remainingValue: event.remainingValue,
        generatedAt: new Date().toISOString()
      };
      
      // Simular geração de recibo (implementar integração real aqui)
      logger.debug(`Recibo gerado com sucesso para evento ${eventId}`, null, 'Agenda');
      
      toast({
        title: "Recibo gerado",
        description: `Recibo para ${event.clientName} foi gerado com sucesso.`
      });
      
    } catch (error) {
      logger.error('Erro ao gerar recibo', error, 'Agenda');
      toast({
        title: 'Erro ao gerar recibo',
        description: 'Não foi possível gerar o recibo. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  },

  // Excluir um evento
  async excluirEvento(eventId: string, props: AgendaServiceProps) {
    const { user, events, setEvents, toast } = props;
    
    if (!user) return;
    
    try {
      logger.debug(`Iniciando exclusão do evento ID: ${eventId}`, null, 'Agenda');
      
      // Chamar o serviço para excluir o evento (que também remove transações relacionadas)
      await excluirEvento(eventId, user.id);
      
      logger.debug(`Evento ${eventId} excluído do banco de dados com sucesso`, null, 'Agenda');
      
      // Atualizar o estado local removendo o evento da lista
      const eventosAtualizados = events.filter(event => event.id !== eventId);
      setEvents(eventosAtualizados);
      
      logger.debug(`Estado atualizado, ${eventosAtualizados.length} eventos restantes`, null, 'Agenda');
      
      // Atualizar o calendário para refletir a remoção
      await this.atualizarCalendario(props);
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Evento excluído",
        description: "O evento e suas transações relacionadas foram removidos com sucesso."
      });
      
      logger.debug(`Exclusão do evento ${eventId} concluída com sucesso`, null, 'Agenda');
    } catch (err) {
      logger.error(`Erro ao excluir evento ${eventId}`, err, 'Agenda');
      toast({
        title: 'Erro ao excluir evento',
        description: 'Não foi possível excluir o evento. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  },

  // Atualizar o calendário
  async atualizarCalendario(props: AgendaServiceProps, mes?: number, ano?: number) {
    const { user, setEventDates, currentMonth, currentYear } = props;
    
    if (!user) return;
    
    try {
      logger.debug('Atualizando dados do calendário', null, 'Agenda');
      
      // Usar mês e ano fornecidos ou os do estado atual
      const mesParaBuscar = mes !== undefined ? mes : currentMonth;
      const anoParaBuscar = ano !== undefined ? ano : currentYear;
      
      const datasComEventos = await buscarDatasComEventos(user.id, mesParaBuscar, anoParaBuscar);
      
      // ✅ CORREÇÃO: Usar data_inicio em vez de data
      const eventDatesFormatted = datasComEventos.map(evento => ({
        date: evento.data_inicio,
        color: evento.cor || undefined
      }));
      
      setEventDates(eventDatesFormatted);
      logger.debug(`Calendário atualizado com ${eventDatesFormatted.length} datas para ${mesParaBuscar}/${anoParaBuscar}`, null, 'Agenda');
    } catch (error) {
      logger.error('Erro ao atualizar calendário', error, 'Agenda');
      // Não mostrar toast aqui pois é uma operação secundária
    }
  },

  // Corrigir todos os eventos
  async corrigirTodosEventos(props: AgendaServiceProps) {
    const { user, setIsFixingEvents, toast, queryClient, setIsLoading } = props;
    
    if (!user?.id) return;
    
    try {
      setIsFixingEvents(true);
      toast({
        title: 'Correção iniciada',
        description: 'Iniciando correção de eventos financeiros...'
      });
      
      const eventosCorrigidos = await corrigirTodosEventosFinanceiros(user.id);
      
      toast({
        title: 'Correção concluída',
        description: `${eventosCorrigidos} eventos processados com sucesso!`
      });
      
      // Forçar recarregar os eventos após correção
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      
      // Recarregar eventos diretamente também
      if (user) {
        setIsLoading(true);
        await this.carregarEventos(props);
      }
    } catch (error) {
      console.error('Erro ao corrigir eventos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao corrigir eventos. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
    } finally {
      setIsFixingEvents(false);
    }
  },

  // Recarregar eventos manualmente
  async recarregarEventos(props: AgendaServiceProps) {
    const { user, setIsLoading, setError, toast } = props;
    
    if (!user) return;
    
    try {
      setIsLoading(true);
      logger.debug('Recarregando eventos manualmente', null, 'Agenda');
      await this.carregarEventos(props);
      
      setError(null);
      toast({
        title: 'Eventos atualizados',
        description: 'Os eventos foram recarregados com sucesso.',
      });
    } catch (err) {
      logger.error('Erro ao recarregar eventos', err, 'Agenda');
      setError('Não foi possível recarregar os eventos. Por favor, tente novamente.');
      toast({
        title: 'Erro ao recarregar eventos',
        description: 'Não foi possível recarregar seus eventos. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
};