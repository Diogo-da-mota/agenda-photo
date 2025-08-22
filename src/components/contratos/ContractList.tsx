import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContractListProps {
  filter?: string;
  searchQuery?: string;
}

const ContractList: React.FC<ContractListProps> = ({ filter, searchQuery }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Contratos</CardTitle>
        <CardDescription>
          Gerencie seus contratos {filter && `- ${filter}`}
          {searchQuery && ` - Busca: "${searchQuery}"`}
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

export { ContractList };
export default ContractList;