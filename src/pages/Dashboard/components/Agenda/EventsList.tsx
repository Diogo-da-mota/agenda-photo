import React from 'react';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between card-title-mobile">
          <span>
            {dateFilter 
              ? `Eventos de ${format(dateFilter, "dd/MM/yyyy", { locale: ptBR })}`
              : 'Eventos Agendados'
            }
          </span>
          <div className="flex flex-wrap gap-1 text-xs status-filters">
            <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/20">Passados</span>
            <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20">Próximos</span>
            <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20">Confirmados</span>
            <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20">Aguardando</span>
            <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20">Concluídos</span>
            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-900/20">Cancelados</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando eventos...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            {error}
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
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
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
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
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsList;