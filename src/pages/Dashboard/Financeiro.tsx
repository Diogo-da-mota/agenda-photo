import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';

const Financeiro = () => {
  return (
    <div className="space-y-6 p-4 pt-0">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo Financeiro
          </CardTitle>
          <CardDescription>
            Gerencie suas transações e receitas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo financeiro em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;