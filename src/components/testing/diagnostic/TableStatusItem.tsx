
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ShieldOff, Check, X, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export type StatusType = 'loading' | 'success' | 'error';

interface RLSInfo {
  hasRLS: boolean;
  policies: any[];
  visibility: {
    success: boolean;
    count?: number;
    error?: string;
  };
}

interface TableStatusItemProps {
  tableName: string;
  status: StatusType;
  rlsInfo?: RLSInfo;
}

const TableStatusItem: React.FC<TableStatusItemProps> = ({ tableName, status, rlsInfo }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'loading':
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  return (
    <Card className={`${
      status === 'success' ? 'border-green-200' : 
      status === 'error' ? 'border-red-200' : 
      'border-gray-200'
    }`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <span className="font-medium">{tableName}</span>
            {rlsInfo && (
              <div className="flex items-center mt-1 space-x-2">
                {rlsInfo.hasRLS ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                          <Shield className="h-3 w-3 text-green-500" />
                          <span className="text-xs">RLS</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>RLS habilitado: {rlsInfo.policies.length} políticas</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="flex items-center gap-1 bg-red-50">
                          <ShieldOff className="h-3 w-3 text-red-500" />
                          <span className="text-xs">Sem RLS</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>RLS não está habilitado nesta tabela</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant={rlsInfo.visibility.success ? "outline" : "destructive"} className="text-xs">
                        {rlsInfo.visibility.count !== undefined ? rlsInfo.visibility.count : '?'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {rlsInfo.visibility.success 
                        ? `${rlsInfo.visibility.count} registros visíveis` 
                        : `Erro de acesso: ${rlsInfo.visibility.error}`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TableStatusItem;
