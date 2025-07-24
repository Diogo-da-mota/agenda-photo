
import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TableStatus {
  table_name: string;
  policies_count: number;
  has_rls: boolean;
  status: 'secure' | 'warning' | 'danger';
}

interface TableStatusCardProps {
  tableStatus: TableStatus;
}

const TableStatusCard: React.FC<TableStatusCardProps> = ({ tableStatus }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'danger':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(tableStatus.status)}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{tableStatus.table_name}</h3>
        {getStatusIcon(tableStatus.status)}
      </div>
      <p className="text-sm">
        {tableStatus.policies_count} política(s) ativa(s)
      </p>
      <Badge variant={tableStatus.has_rls ? "default" : "destructive"} className="mt-2">
        {tableStatus.has_rls ? "RLS Ativo" : "RLS Inativo"}
      </Badge>
    </div>
  );
};

export default TableStatusCard;
