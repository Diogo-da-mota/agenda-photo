import React from 'react';
import { Check, Clock, X, Ban } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type ContractStatus = 'pendente' | 'assinado' | 'expirado' | 'cancelado';

interface StatusSelectorProps {
  currentStatus: ContractStatus;
  onStatusChange: (newStatus: ContractStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  size = 'default'
}) => {
  const getStatusIcon = (status: ContractStatus) => {
    const iconSize = size === 'sm' ? 12 : 14;
    
    switch (status) {
      case 'pendente':
        return <Clock size={iconSize} className="text-yellow-500" />;
      case 'assinado':
        return <Check size={iconSize} className="text-green-500" />;
      case 'expirado':
        return <X size={iconSize} className="text-red-500" />;
      case 'cancelado':
        return <Ban size={iconSize} className="text-gray-500" />;
      default:
        return <Clock size={iconSize} className="text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: ContractStatus) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'assinado':
        return 'Assinado';
      case 'expirado':
        return 'Expirado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case 'pendente':
        return 'text-yellow-500 border-yellow-500';
      case 'assinado':
        return 'text-green-500 border-green-500';
      case 'expirado':
        return 'text-red-500 border-red-500';
      case 'cancelado':
        return 'text-gray-500 border-gray-500';
      default:
        return 'text-yellow-500 border-yellow-500';
    }
  };

  const statusOptions: ContractStatus[] = ['pendente', 'assinado', 'expirado', 'cancelado'];

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => onStatusChange(value as ContractStatus)}
      disabled={disabled}
    >
      <SelectTrigger className={`w-auto min-w-[120px] ${size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm'}`}>
        <SelectValue>
          <div className="flex items-center gap-2">
            {getStatusIcon(currentStatus)}
            <span>{getStatusLabel(currentStatus)}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem key={status} value={status}>
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span>{getStatusLabel(status)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;

// Componente alternativo como Badge clicável para espaços menores
export const StatusBadgeSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const getStatusIcon = (status: ContractStatus) => {
    switch (status) {
      case 'pendente':
        return <Clock size={12} />;
      case 'assinado':
        return <Check size={12} />;
      case 'expirado':
        return <X size={12} />;
      case 'cancelado':
        return <Ban size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const getStatusLabel = (status: ContractStatus) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'assinado':
        return 'Assinado';
      case 'expirado':
        return 'Expirado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  };

  const getStatusVariant = (status: ContractStatus) => {
    switch (status) {
      case 'pendente':
        return 'outline' as const;
      case 'assinado':
        return 'default' as const;
      case 'expirado':
        return 'destructive' as const;
      case 'cancelado':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case 'pendente':
        return 'text-yellow-500 border-yellow-500';
      case 'assinado':
        return 'text-green-500 border-green-500';
      case 'expirado':
        return 'text-red-500 border-red-500';
      case 'cancelado':
        return 'text-gray-500 border-gray-500';
      default:
        return 'text-yellow-500 border-yellow-500';
    }
  };

  const statusOptions: ContractStatus[] = ['pendente', 'assinado', 'expirado', 'cancelado'];

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => onStatusChange(value as ContractStatus)}
      disabled={disabled}
    >
      <SelectTrigger asChild>
        <Badge 
          variant="outline" 
          className={`cursor-pointer hover:bg-muted/50 ${getStatusColor(currentStatus)}`}
        >
          {getStatusIcon(currentStatus)}
          <span className="ml-1">{getStatusLabel(currentStatus)}</span>
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem key={status} value={status}>
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span>{getStatusLabel(status)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};