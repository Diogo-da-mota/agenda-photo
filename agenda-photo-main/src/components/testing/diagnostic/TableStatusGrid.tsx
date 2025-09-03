
import React from 'react';
import TableStatusItem, { StatusType } from './TableStatusItem';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export interface TableStatusGridProps {
  tables: string[];
  results: { [key: string]: StatusType };
  rlsStatus?: { 
    [key: string]: { 
      hasRLS: boolean; 
      policies: any[]; 
      visibility: { 
        success: boolean; 
        count?: number; 
        error?: string; 
      }; 
    } 
  };
  onRefresh?: () => Promise<void>;
}

const TableStatusGrid: React.FC<TableStatusGridProps> = ({ 
  tables, 
  results,
  rlsStatus,
  onRefresh 
}) => {
  return (
    <div className="space-y-4">
      {onRefresh && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map(table => (
          <TableStatusItem 
            key={table}
            tableName={table}
            status={results[table] || 'loading'} 
            rlsInfo={rlsStatus ? rlsStatus[table] : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default TableStatusGrid;
