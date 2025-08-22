import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ContractList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Contratos</CardTitle>
        <CardDescription>
          Gerencie seus contratos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Nenhum contrato encontrado
        </p>
      </CardContent>
    </Card>
  );
};

export default ContractList;