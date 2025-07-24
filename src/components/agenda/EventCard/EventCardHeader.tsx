import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { EventCardHeaderProps } from './types';

const EventCardHeader: React.FC<EventCardHeaderProps> = ({
  event,
  onEdit,
  onDelete,
  onReschedule,
  onMarkAsCompleted,
  isDeleting
}) => {
  return (
    <CardHeader className="pb-2">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
        
        {/* Ícones de Ação - Reordenados para o topo em telas pequenas */}
        <div className="flex w-full justify-center md:justify-end space-x-2 md:space-x-1 order-1 md:order-2 mb-2 md:mb-0">
          <button 
            className="p-1 rounded hover:bg-gray-100" 
            title="Editar"
            onClick={onEdit}
          >
            <Edit size={18} />
          </button>
          <button 
            className="p-1 rounded hover:bg-red-100 hover:text-red-600 transition-colors" 
            title="Excluir evento"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 size={18} className="text-red-500 hover:text-red-700" />
          </button>
          <button 
            className="p-1 rounded hover:bg-gray-100" 
            title="Reagendar"
            onClick={onReschedule}
          >
            <RefreshCw size={18} />
          </button>
          <button 
            className={`p-1 rounded hover:bg-gray-100 ${event.status === 'completed' ? 'text-green-600' : ''}`}
            title="Marcar como concluído"
            onClick={onMarkAsCompleted}
          >
            <CheckCircle size={18} />
          </button>
        </div>

        {/* Informações do Evento - Nome e Data */}
        <div className="text-center md:text-left order-2 md:order-1 w-full overflow-hidden">
          <CardTitle className="text-xl font-bold whitespace-nowrap truncate">{event.clientName}</CardTitle>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            {format(event.date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>
    </CardHeader>
  );
};

export default EventCardHeader;
