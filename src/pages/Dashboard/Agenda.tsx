import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';

// Componentes extraídos
import AgendaHeader from './components/Agenda/AgendaHeader';
import AgendaFilters from './components/Agenda/AgendaFilters';
import AgendaCalendar from './components/Agenda/AgendaCalendar';
import EventsList from './components/Agenda/EventsList';
import EventModal from './components/Agenda/EventModal';

// Serviços e tipos
import { agendaBusinessService, AgendaServiceProps } from '@/services/agendaBusinessService';
import { Event, EventStatus, PartialEventFinancials } from '@/components/agenda/types';
import './Agenda.css';

// Componente principal da Agenda
const Agenda = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventDates, setEventDates] = useState<{ date: Date; color?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>(
    searchParams.get('view') === 'list' ? 'list' : 'calendar'
  );
  const [isFixingEvents, setIsFixingEvents] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  
  // Debounce para o campo de busca
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Props para o serviço
  const serviceProps: AgendaServiceProps = {
    user,
    events,
    setEvents,
    setEventDates,
    setIsLoading,
    setError,
    setIsFixingEvents,
    currentMonth,
    currentYear,
    toast,
    queryClient
  };

  // Função para alterar a visualização e atualizar a URL
  const changeView = (newView: 'calendar' | 'list') => {
    setView(newView);
    setSearchParams({ view: newView });
  };

  // Função para filtrar eventos por data quando uma data do calendário é clicada
  const handleDateClick = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDateFilter(date);
    }
  };

  // Função para limpar o filtro de data e mostrar todos os eventos
  const clearDateFilter = () => {
    setDateFilter(null);
    toast({
      title: 'Filtro removido',
      description: 'Mostrando todos os eventos',
    });
  };

  // Carregar eventos do Supabase
  useEffect(() => {
    if (user) {
      agendaBusinessService.carregarEventos(serviceProps);
    }
  }, [user]);

  // Filtrar e ordenar eventos
  const filteredEvents = useMemo(() => {
    return agendaBusinessService.filtrarEventos(events, searchQuery, statusFilter, dateFilter);
  }, [events, searchQuery, statusFilter, dateFilter]);

  // Debug: Log das datas para verificar se estão ordenadas
  React.useEffect(() => {
    if (filteredEvents.length > 0) {
      console.log('🔍 DEBUG: Eventos após filtro (verificando ordenação):');
      filteredEvents.forEach((event, index) => {
        console.log(`${index + 1}. ${event.clientName} - ${event.date.toISOString()}`);
      });
    }
  }, [filteredEvents]);
  
  // Handlers para eventos
  const handleStatusChange = async (eventId: string, newStatus: EventStatus, financials?: PartialEventFinancials) => {
    await agendaBusinessService.alterarStatusEvento(eventId, newStatus, financials, serviceProps);
  };
  
  const handleReschedule = async (eventId: string, newDate: Date) => {
    await agendaBusinessService.reagendarEvento(eventId, newDate, serviceProps);
  };
  
  const handleSendReminder = async (eventId: string) => {
    await agendaBusinessService.enviarLembrete(eventId, serviceProps);
  };
  
  const handleGenerateReceipt = (eventId: string) => {
    agendaBusinessService.gerarRecibo(eventId, serviceProps);
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    await agendaBusinessService.excluirEvento(eventId, serviceProps);
  };
  
  // Função para atualizar um evento após edição
  const handleEventUpdated = (updatedEvent: Event) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id 
        ? updatedEvent 
        : event
    ));
    
    // Atualizar o calendário
    agendaBusinessService.atualizarCalendario(serviceProps);
    
    toast({
      title: "Evento atualizado",
      description: `O evento foi atualizado com sucesso.`
    });
  };
  
  // Função para adicionar novo evento criado à lista
  const handleEventCreated = (newEvent: Event) => {
    setEvents(prevEvents => [...prevEvents, newEvent]);
    
    // Atualizar o calendário
    agendaBusinessService.atualizarCalendario(serviceProps);
  };

  // Função para corrigir todos os eventos
  const handleFixAllEvents = async () => {
    await agendaBusinessService.corrigirTodosEventos(serviceProps);
  };

  // Função para recarregar eventos manualmente
  const recarregarEventos = async () => {
    await agendaBusinessService.recarregarEventos(serviceProps);
  };

  // Handler para mudança de mês no calendário
  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    agendaBusinessService.atualizarCalendario(serviceProps, month, year);
  };

  return (
    <div className="container mx-auto p-4 mt-2">
      <AgendaHeader
        localSearchQuery={localSearchQuery}
        onSearchChange={setLocalSearchQuery}
        onNewEventClick={() => setIsModalOpen(true)}
      />

      <AgendaFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onClearDateFilter={clearDateFilter}
      />

      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna do Calendário */}
          <div className="lg:col-span-1">
            <AgendaCalendar
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              eventDates={eventDates}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={handleMonthChange}
            />
          </div>
          
          {/* Coluna dos Eventos */}
          <div className="lg:col-span-2">
            <EventsList
              filteredEvents={filteredEvents}
              isLoading={isLoading}
              error={error}
              dateFilter={dateFilter}
              onClearDateFilter={clearDateFilter}
              onStatusChange={handleStatusChange}
              onReschedule={handleReschedule}
              onSendReminder={handleSendReminder}
              onGenerateReceipt={handleGenerateReceipt}
              onDeleteEvent={handleDeleteEvent}
              onEventUpdate={handleEventUpdated}
            />
          </div>
        </div>
      </div>
      
      {/* Modal de Novo Evento */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default Agenda;