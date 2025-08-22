import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/components/agenda/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventsListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

const EventsList: React.FC<EventsListProps> = ({ events, onEventClick }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'default';
      case 'pendente':
        return 'secondary';
      case 'cancelado':
        return 'destructive';
      case 'concluido':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhum evento encontrado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEventClick(event)}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{event.clientName}</CardTitle>
                <CardDescription>{event.eventType}</CardDescription>
              </div>
              <Badge variant={getStatusVariant(event.status)}>
                {event.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Data:</strong> {format(event.date, 'dd/MM/yyyy', { locale: ptBR })}</p>
              <p><strong>Horário:</strong> {event.startTime}{event.endTime && ` - ${event.endTime}`}</p>
              <p><strong>Local:</strong> {event.location}</p>
              {event.totalValue && (
                <p><strong>Valor:</strong> R$ {event.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventsList;