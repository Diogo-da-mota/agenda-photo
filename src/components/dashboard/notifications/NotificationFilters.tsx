
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface NotificationFiltersProps {
  totalCount: number;
  filterType: string;
  filterStatus: string;
  filterDate: string;
  onFilterTypeChange: (value: string) => void;
  onFilterStatusChange: (value: string) => void;
  onFilterDateChange: (value: string) => void;
  resetFilters: () => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  totalCount,
  filterType,
  filterStatus,
  filterDate,
  onFilterTypeChange,
  onFilterStatusChange,
  onFilterDateChange,
  resetFilters
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <h3 className="font-medium">Filtros</h3>
          <Badge variant="secondary">{totalCount} notificações</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Limpar filtros
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-500 block mb-1">Tipo</label>
          <Select value={filterType} onValueChange={onFilterTypeChange}>
            <SelectTrigger className="bg-[#3c83f6] text-white hover:bg-[#3371d6]">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="event">Eventos</SelectItem>
              <SelectItem value="payment">Pagamentos</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
              <SelectItem value="reminder">Lembretes</SelectItem>
              <SelectItem value="birthday">Aniversários</SelectItem>
              <SelectItem value="dasmei">DAS-MEI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-gray-500 block mb-1">Status</label>
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger className="bg-[#3c83f6] text-white hover:bg-[#3371d6]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-gray-500 block mb-1">Data</label>
          <Select value={filterDate} onValueChange={onFilterDateChange}>
            <SelectTrigger className="bg-[#3c83f6] text-white hover:bg-[#3371d6]">
              <SelectValue placeholder="Todos as datas" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="all">Todas as datas</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;
