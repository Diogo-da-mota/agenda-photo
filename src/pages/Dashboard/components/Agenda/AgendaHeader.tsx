import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AgendaHeaderProps {
  onNewEvent: () => void;
}

const AgendaHeader: React.FC<AgendaHeaderProps> = ({ onNewEvent }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">
          Gerencie seus eventos e compromissos
        </p>
      </div>
      <Button onClick={onNewEvent}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Evento
      </Button>
    </div>
  );
};

export default AgendaHeader;