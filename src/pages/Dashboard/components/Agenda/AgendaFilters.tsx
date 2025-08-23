import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendaFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: Date | null;
  onClearDateFilter: () => void;
}

const AgendaFilters: React.FC<AgendaFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onClearDateFilter
}) => {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-2">
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="border rounded-md h-10 px-3 text-sm text-white bg-[#3c83f6] hover:bg-[#2c73e6] transition-colors w-full md:w-auto"
      >
        <option value="all">Todos os eventos</option>
        <option value="upcoming">Próximos</option>
        <option value="confirmed">Confirmados</option>
        <option value="pending">Aguardando</option>
        <option value="completed">Concluídos</option>
        <option value="canceled">Cancelados</option>
        <option value="past">Passados</option>
      </select>

      {dateFilter && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearDateFilter}
          className="flex items-center gap-1 w-full md:w-auto justify-center"
        >
          <Filter className="h-4 w-4" />
          Limpar filtro: {format(dateFilter, "dd/MM", { locale: ptBR })}
        </Button>
      )}
    </div>
  );
};

export default AgendaFilters;