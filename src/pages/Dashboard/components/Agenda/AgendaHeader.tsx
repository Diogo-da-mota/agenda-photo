import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AgendaHeaderProps {
  localSearchQuery: string;
  onSearchChange: (value: string) => void;
  onNewEventClick: () => void;
}

const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  localSearchQuery,
  onSearchChange,
  onNewEventClick
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-1 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex items-center justify-center md:justify-start w-full">
        <h1 className="text-2xl font-bold">Agenda</h1>
      </div>
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar eventos..."
            value={localSearchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 w-full h-10"
          />
        </div>
        
        <Button onClick={onNewEventClick} className="w-full md:w-auto h-10">
          <Plus className="h-4 w-4 mr-1" /> Novo Evento
        </Button>
      </div>
    </div>
  );
};

export default AgendaHeader;