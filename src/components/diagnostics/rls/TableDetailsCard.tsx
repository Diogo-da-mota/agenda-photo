
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PolicyStatus, AuditResult } from './types';

interface TableDetailsCardProps {
  result: AuditResult;
  getSuggestion: (table: string) => string;
}

const TableDetailsCard: React.FC<TableDetailsCardProps> = ({ result, getSuggestion }) => {
  const { tableName, status, hasRLS, policies = [] } = result;
  
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'error': return 'bg-red-50 border-red-100';
    }
  };

  return (
    <Card className={`${getStatusColor()}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span>{tableName}</span>
          </div>
          <Badge variant={hasRLS ? "outline" : "destructive"} className="ml-2">
            {hasRLS ? 'RLS Ativado' : 'Sem RLS'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="text-sm">
          <p className="font-medium">Sugestão:</p>
          <p className="text-gray-600">{getSuggestion(tableName)}</p>
        </div>
        
        {policies && policies.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <p className="font-medium text-sm mb-2">Políticas existentes:</p>
            <div className="grid grid-cols-1 gap-1">
              {policies.map((policy, index) => (
                <div key={index} className="flex items-center gap-2 text-xs bg-white p-2 rounded border">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="font-medium">{policy.policyname || policy.cmd}:</span>
                  <span className="text-gray-600">{policy.cmd}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableDetailsCard;
