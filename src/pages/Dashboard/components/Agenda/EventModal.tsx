import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/components/agenda/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Phone, Mail, DollarSign } from 'lucide-react';

interface EventModalProps {
  event?: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onEventCreated?: (newEvent: Event) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!event) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">{event.clientName}</DialogTitle>
              <p className="text-muted-foreground">{event.eventType}</p>
            </div>
            <Badge variant={getStatusVariant(event.status)}>
              {event.status}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(event.date, 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{event.startTime || event.time}{event.endTime && ` - ${event.endTime}`}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
            
            {(event.clientPhone || event.phone) && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{event.clientPhone || event.phone}</span>
              </div>
            )}
            
            {event.clientEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{event.clientEmail}</span>
              </div>
            )}
            
            {event.totalValue && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>R$ {event.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
          
          {event.notes && (
            <div>
              <h4 className="font-semibold mb-2">Observações</h4>
              <p className="text-muted-foreground">{event.notes}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(event)}>
                Editar
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(event.id)}>
                Excluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;