
import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PolicyStatus, AuditResult } from './types';

interface TableStatusDisplayProps {
  auditResults: AuditResult[];
}

const TableStatusDisplay: React.FC<TableStatusDisplayProps> = ({ auditResults }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {auditResults.map((result) => {
        const { tableName, status } = result;
        
        // Determinar ícone e cor com base no status
        let icon;
        let bgColor;
        
        switch (status) {
          case 'success':
            icon = <ShieldCheck className="h-4 w-4 text-green-500" />;
            bgColor = 'bg-green-50 border-green-100';
            break;
          case 'warning':
            icon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
            bgColor = 'bg-amber-50 border-amber-100';
            break;
          case 'error':
            icon = <ShieldAlert className="h-4 w-4 text-red-500" />;
            bgColor = 'bg-red-50 border-red-100';
            break;
        }
        
        return (
          <div 
            key={tableName} 
            className={`flex items-center rounded-md border p-2 text-sm ${bgColor}`}
          >
            {icon}
            <span className="ml-2 truncate">{tableName}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TableStatusDisplay;
