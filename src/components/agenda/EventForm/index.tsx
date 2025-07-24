import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from 'lucide-react';

interface EventFormProps {
  event?: any;
  onClose?: () => void;
  onEventCreated?: (event: any) => void;
}

const EventForm: React.FC<EventFormProps> = ({ 
  event, 
  onClose, 
  onEventCreated 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {event ? 'Editar Evento' : 'Novo Evento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Formulário de evento em desenvolvimento...</p>
      </CardContent>
    </Card>
  );
};

export default EventForm;