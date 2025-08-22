import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AgendaHeaderProps {
  searchQuery?: string;
  localSearchQuery?: string;
  onSearchChange: (query: string) => void;
  onNewEventClick: () => void;
  onNewEvent?: () => void;
}

const AgendaHeader: React.FC<AgendaHeaderProps> = ({ onNewEvent, onNewEventClick, localSearchQuery, onSearchChange }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">
          Gerencie seus eventos e compromissos
        </p>
      </div>
      <Button onClick={onNewEventClick || onNewEvent}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Evento
      </Button>
    </div>
  );
};

export default AgendaHeader;