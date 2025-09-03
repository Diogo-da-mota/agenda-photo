import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EventCard from '@/components/agenda/EventCard';
import { Event, EventStatus, PartialEventFinancials } from '@/components/agenda/types';

interface EventsListProps {
  filteredEvents: Event[];
  isLoading: boolean;
  error: string | null;
  dateFilter: Date | null;
  onClearDateFilter: () => void;
  onStatusChange: (eventId: string, newStatus: EventStatus, financials?: PartialEventFinancials) => void;
  onReschedule: (eventId: string, newDate: Date) => void;
  onSendReminder: (eventId: string) => void;
  onGenerateReceipt: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onEventUpdate: (updatedEvent: Event) => void;
}

// Configuração das seções por status
const statusSections = [
  { key: 'upcoming' as EventStatus, title: 'Próximos', color: 'bg-amber-100 dark:bg-amber-900/20' },
  { key: 'confirmed' as EventStatus, title: 'Confirmados', color: 'bg-green-100 dark:bg-green-900/20' },
  { key: 'pending' as EventStatus, title: 'Aguardando', color: 'bg-blue-100 dark:bg-blue-900/20' },
  { key: 'completed' as EventStatus, title: 'Concluídos', color: 'bg-purple-100 dark:bg-purple-900/20' },
  { key: 'canceled' as EventStatus, title: 'Cancelados', color: 'bg-gray-100 dark:bg-gray-900/20' },
];

const EventsList: React.FC<EventsListProps> = ({
  filteredEvents,
  isLoading,
  error,
  dateFilter,
  onClearDateFilter,
  onStatusChange,
  onReschedule,
  onSendReminder,
  onGenerateReceipt,
  onDeleteEvent,
  onEventUpdate
}) => {
  // Agrupar eventos por status
  const eventsByStatus = useMemo(() => {
    const grouped: Record<EventStatus, Event[]> = {
      upcoming: [],
      confirmed: [],
      pending: [],
      completed: [],
      canceled: [],
      past: []
    };

    filteredEvents.forEach(event => {
      if (grouped[event.status]) {
        grouped[event.status].push(event);
      }
    });

    return grouped;
  }, [filteredEvents]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando eventos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center text-red-500 py-8">
          {error}
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center text-gray-500 py-8">
          {dateFilter ? (
            <div>
              <p>Nenhum evento encontrado para {format(dateFilter, "dd/MM/yyyy", { locale: ptBR })}.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearDateFilter}
                className="mt-2"
              >
                Ver todos os eventos
              </Button>
            </div>
          ) : (
            <p>Nenhum evento encontrado com os filtros selecionados.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com título e filtros */}
      <Card className="eventos-agendados-header">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {dateFilter 
                ? `Eventos de ${format(dateFilter, "dd/MM/yyyy", { locale: ptBR })}`
                : 'Eventos Agendados'
              }
            </CardTitle>
            <div className="flex flex-wrap gap-1 text-xs">
              <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20">Próximos</span>
              <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20">Confirmados</span>
              <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20">Aguardando</span>
              <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20">Concluídos</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-900/20">Cancelados</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de seções */}
      {statusSections.map(section => {
        const sectionEvents = eventsByStatus[section.key];
        
        if (sectionEvents.length === 0) return null;
        
        return (
          <Card key={section.key} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className={`text-xl font-bold px-3 py-2 rounded-lg ${section.color} border inline-block flex items-center gap-2`}>
                <span className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-sm font-medium">
                  {sectionEvents.length}
                </span>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sectionEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onStatusChange={onStatusChange}
                  onReschedule={onReschedule}
                  onSendReminder={onSendReminder}
                  onGenerateReceipt={onGenerateReceipt}
                  onDelete={onDeleteEvent}
                  onEventUpdate={onEventUpdate}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EventsList;