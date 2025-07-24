
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AuditStatsProps {
  total: number;
  success: number;
  warning: number;
  error: number;
}

const AuditStats: React.FC<AuditStatsProps> = ({ total, success, warning, error }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
          <Shield className="h-6 w-6 text-gray-400" />
        </CardContent>
      </Card>
      
      <Card className="bg-green-50 border-green-100">
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600">Seguras</p>
            <p className="text-2xl font-bold text-green-700">{success}</p>
          </div>
          <ShieldCheck className="h-6 w-6 text-green-500" />
        </CardContent>
      </Card>
      
      <Card className="bg-amber-50 border-amber-100">
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-600">Atenção</p>
            <p className="text-2xl font-bold text-amber-700">{warning}</p>
          </div>
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </CardContent>
      </Card>
      
      <Card className="bg-red-50 border-red-100">
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600">Desprotegidas</p>
            <p className="text-2xl font-bold text-red-700">{error}</p>
          </div>
          <ShieldAlert className="h-6 w-6 text-red-500" />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditStats;
