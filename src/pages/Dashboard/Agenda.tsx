import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      <div className="flex flex-col space-y-4 mb-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center justify-center md:justify-start">
          <h1 className="text-4xl font-bold">Agenda</h1>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-2">
          <AgendaFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dateFilter={dateFilter}
            onClearDateFilter={clearDateFilter}
          />
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar eventos..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-8 w-full h-10"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto h-10">
            <Plus className="h-4 w-4 mr-1" /> Novo Evento
          </Button>
        </div>
      </div>

      <div className="space-y-6 mt-3">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
          <div className="lg:col-span-3">
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