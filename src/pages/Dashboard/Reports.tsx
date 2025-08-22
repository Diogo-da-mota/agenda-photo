import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Visualize relatórios e estatísticas do seu negócio
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Relatórios</CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível em breve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Em desenvolvimento...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;