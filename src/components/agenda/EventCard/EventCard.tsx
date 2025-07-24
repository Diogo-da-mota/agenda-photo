import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin } from 'lucide-react';

interface EventCardProps {
  id?: string;
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  status?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  title = "Evento",
  date = "Data não definida",
  time = "Horário não definido", 
  location = "Local não definido",
  status = "agendado"
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{date}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              status === 'agendado' ? 'bg-blue-100 text-blue-800' :
              status === 'confirmado' ? 'bg-green-100 text-green-800' :
              status === 'cancelado' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;